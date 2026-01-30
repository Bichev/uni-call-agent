import { buildSystemPrompt, getToolDefinitions } from './context-builder'
import type { LeadData, ConversationSummary } from '../types'

export type RealtimeEventHandler = {
  onConnecting?: () => void
  onConnected?: () => void
  onDisconnected?: () => void
  onError?: (error: string) => void
  onSpeechStarted?: () => void
  onSpeechEnded?: () => void
  onTranscript?: (text: string, isFinal: boolean) => void
  onResponseStarted?: () => void
  onResponseText?: (text: string, isFinal: boolean) => void
  onResponseEnded?: () => void
  onLeadCaptured?: (lead: LeadData) => void
  onSummaryGenerated?: (summary: ConversationSummary) => void
  onAudioLevel?: (level: number) => void
}

export class RealtimeClient {
  private peerConnection: RTCPeerConnection | null = null
  private dataChannel: RTCDataChannel | null = null
  private localStream: MediaStream | null = null
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private handlers: RealtimeEventHandler = {}
  private isConnected = false
  private audioLevelInterval: number | null = null

  constructor() {
    this.peerConnection = null
  }

  setHandlers(handlers: RealtimeEventHandler) {
    this.handlers = handlers
  }

  private async getToken(): Promise<string> {
    // In development, try the API endpoint first, then fall back to direct OpenAI call
    // In production, always use the API endpoint
    
    try {
      // Try the Vercel API endpoint first
      const tokenResponse = await fetch('/api/token')
      if (tokenResponse.ok) {
        const { token } = await tokenResponse.json()
        return token
      }
    } catch (e) {
      console.log('API endpoint not available, trying direct method...')
    }

    // Development fallback: use environment variable directly
    // Note: This is only for local development - in production, use the API route
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Add VITE_OPENAI_API_KEY to .env.local for development, or deploy to Vercel with OPENAI_API_KEY.')
    }

    // Get ephemeral token directly from OpenAI (development only)
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'alloy'
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to get session token from OpenAI')
    }

    const data = await response.json()
    console.log('Token response:', JSON.stringify(data, null, 2).substring(0, 200))
    return data.client_secret?.value || data.value
  }

  async connect(): Promise<void> {
    this.handlers.onConnecting?.()

    try {
      // Get ephemeral token
      const token = await this.getToken()
      console.log('Got ephemeral token:', token?.substring(0, 20) + '...')

      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      // Setup audio analysis for visualization
      this.setupAudioAnalysis()

      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })

      // Add local audio track
      this.localStream.getAudioTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!)
      })

      // Handle remote audio
      this.peerConnection.ontrack = (event) => {
        const audio = new Audio()
        audio.srcObject = event.streams[0]
        audio.play().catch(console.error)
      }

      // Create data channel for events
      this.dataChannel = this.peerConnection.createDataChannel('oai-events')
      this.setupDataChannel()

      // Create and set local description
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)
      console.log('Local SDP offer created')

      // Wait for ICE gathering
      await this.waitForIceGathering()
      console.log('ICE gathering complete')

      // Send offer to OpenAI Realtime API
      const model = 'gpt-4o-realtime-preview-2024-12-17'
      const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/sdp'
        },
        body: this.peerConnection.localDescription!.sdp
      })

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text().catch(() => '')
        console.error('WebRTC connection error:', sdpResponse.status, errorText)
        throw new Error(`Failed to establish WebRTC connection: ${sdpResponse.status}`)
      }

      const answerSdp = await sdpResponse.text()
      await this.peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp
      })

      this.isConnected = true
      this.handlers.onConnected?.()

      // Configure session after connection
      this.configureSession()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed'
      this.handlers.onError?.(errorMessage)
      this.disconnect()
      throw error
    }
  }

  private async waitForIceGathering(): Promise<void> {
    if (this.peerConnection?.iceGatheringState === 'complete') {
      return
    }

    return new Promise((resolve) => {
      const checkState = () => {
        if (this.peerConnection?.iceGatheringState === 'complete') {
          resolve()
        }
      }
      
      this.peerConnection?.addEventListener('icegatheringstatechange', checkState)
      
      // Timeout after 5 seconds
      setTimeout(resolve, 5000)
    })
  }

  private setupDataChannel() {
    if (!this.dataChannel) return

    this.dataChannel.onopen = () => {
      console.log('Data channel opened')
    }

    this.dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleServerEvent(data)
      } catch (error) {
        console.error('Failed to parse server event:', error)
      }
    }

    this.dataChannel.onerror = (error) => {
      console.error('Data channel error:', error)
      this.handlers.onError?.('Data channel error')
    }

    this.dataChannel.onclose = () => {
      console.log('Data channel closed')
      this.handlers.onDisconnected?.()
    }
  }

  private configureSession() {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      // Wait for data channel to open
      setTimeout(() => this.configureSession(), 100)
      return
    }

    const sessionConfig = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        instructions: buildSystemPrompt(),
        voice: 'alloy',
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1'
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500
        },
        tools: getToolDefinitions()
      }
    }

    this.dataChannel.send(JSON.stringify(sessionConfig))
    
    // Trigger AI to introduce itself after a short delay
    setTimeout(() => this.triggerGreeting(), 500)
  }

  private triggerGreeting() {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') return

    console.log('Triggering AI greeting...')
    
    // Send a response.create to make the AI speak first
    const responseCreate = {
      type: 'response.create',
      response: {
        modalities: ['text', 'audio'],
        instructions: 'Introduce yourself as Aria, the AI assistant from CommuniKATE. Mention that you are an AI and offer to help with questions about branding, web design, and marketing services, or to schedule a consultation with Kate. Keep the greeting warm and concise (2-3 sentences max).'
      }
    }

    this.dataChannel.send(JSON.stringify(responseCreate))
  }

  private handleServerEvent(event: Record<string, unknown>) {
    const type = event.type as string

    switch (type) {
      case 'session.created':
      case 'session.updated':
        console.log('Session configured:', event)
        break

      case 'input_audio_buffer.speech_started':
        this.handlers.onSpeechStarted?.()
        break

      case 'input_audio_buffer.speech_stopped':
        this.handlers.onSpeechEnded?.()
        break

      case 'conversation.item.input_audio_transcription.completed':
        const transcript = (event as { transcript?: string }).transcript
        if (transcript) {
          this.handlers.onTranscript?.(transcript, true)
        }
        break

      case 'response.created':
        this.handlers.onResponseStarted?.()
        break

      case 'response.output_text.delta':
        const textDelta = (event as { delta?: string }).delta
        if (textDelta) {
          this.handlers.onResponseText?.(textDelta, false)
        }
        break

      case 'response.output_text.done':
        const textFinal = (event as { text?: string }).text
        if (textFinal) {
          this.handlers.onResponseText?.(textFinal, true)
        }
        break

      case 'response.done':
        this.handlers.onResponseEnded?.()
        break

      case 'response.function_call_arguments.done':
        this.handleFunctionCall(event as { name: string; arguments: string })
        break

      case 'error':
        const errorMessage = (event as { error?: { message?: string } }).error?.message || 'Unknown error'
        this.handlers.onError?.(errorMessage)
        break
    }
  }

  private handleFunctionCall(event: { name: string; arguments: string }) {
    try {
      const args = JSON.parse(event.arguments)
      console.log(`Function called: ${event.name}`, args)

      switch (event.name) {
        case 'capture_lead':
          console.log('Lead captured:', args)
          this.handlers.onLeadCaptured?.(args as LeadData)
          break

        case 'generate_summary':
          const summary: ConversationSummary = {
            topicsDiscussed: args.topicsDiscussed?.split(',').map((s: string) => s.trim()) || [],
            keyQuestions: args.keyQuestions?.split(',').map((s: string) => s.trim()) || [],
            followUpActions: args.followUpActions?.split(',').map((s: string) => s.trim()) || [],
            sentiment: args.sentiment || 'neutral',
            duration: 0,
            messageCount: 0
          }
          console.log('Summary generated:', summary)
          this.handlers.onSummaryGenerated?.(summary)
          break

        case 'schedule_callback':
          // Handle callback scheduling - add to lead notes
          console.log('Callback scheduled:', args)
          const meetingNote = `Meeting requested: ${args.reason || 'Consultation'}${args.preferredDate ? ` on ${args.preferredDate}` : ''}${args.preferredTime ? ` at ${args.preferredTime}` : ''}`
          this.handlers.onLeadCaptured?.({ 
            notes: meetingNote,
            preferredTime: args.preferredTime || args.preferredDate
          } as LeadData)
          break
      }
    } catch (error) {
      console.error('Failed to handle function call:', error)
    }
  }

  private setupAudioAnalysis() {
    if (!this.localStream) return

    this.audioContext = new AudioContext()
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 256

    const source = this.audioContext.createMediaStreamSource(this.localStream)
    source.connect(this.analyser)

    // Start monitoring audio levels
    this.audioLevelInterval = window.setInterval(() => {
      if (!this.analyser) return
      
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount)
      this.analyser.getByteFrequencyData(dataArray)
      
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
      const normalized = average / 255
      
      this.handlers.onAudioLevel?.(normalized)
    }, 50)
  }

  sendMessage(text: string) {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('Data channel not ready')
      return
    }

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    }

    this.dataChannel.send(JSON.stringify(event))
    
    // Trigger response
    this.dataChannel.send(JSON.stringify({ type: 'response.create' }))
  }

  disconnect() {
    if (this.audioLevelInterval) {
      clearInterval(this.audioLevelInterval)
      this.audioLevelInterval = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    if (this.dataChannel) {
      this.dataChannel.close()
      this.dataChannel = null
    }

    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    this.isConnected = false
    this.handlers.onDisconnected?.()
  }

  getIsConnected() {
    return this.isConnected
  }
}

// Singleton instance
let realtimeClient: RealtimeClient | null = null

export function getRealtimeClient(): RealtimeClient {
  if (!realtimeClient) {
    realtimeClient = new RealtimeClient()
  }
  return realtimeClient
}
