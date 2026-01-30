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

  async connect(): Promise<void> {
    this.handlers.onConnecting?.()

    try {
      // Get ephemeral token from our API
      const tokenResponse = await fetch('/api/token')
      if (!tokenResponse.ok) {
        throw new Error('Failed to get session token')
      }
      const { token } = await tokenResponse.json()

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

      // Wait for ICE gathering
      await this.waitForIceGathering()

      // Send offer to OpenAI
      const sdpResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/sdp'
        },
        body: this.peerConnection.localDescription!.sdp
      })

      if (!sdpResponse.ok) {
        throw new Error('Failed to establish WebRTC connection')
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
        type: 'realtime',
        model: 'gpt-realtime',
        instructions: buildSystemPrompt(),
        tools: getToolDefinitions(),
        audio: {
          input: {
            format: 'pcm16',
            sample_rate: 24000
          },
          output: {
            voice: 'alloy',
            format: 'pcm16',
            sample_rate: 24000
          }
        },
        input_audio_transcription: {
          model: 'whisper-1'
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500
        }
      }
    }

    this.dataChannel.send(JSON.stringify(sessionConfig))
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

      switch (event.name) {
        case 'capture_lead':
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
          this.handlers.onSummaryGenerated?.(summary)
          break

        case 'schedule_callback':
          // Handle callback scheduling
          console.log('Callback scheduled:', args)
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
