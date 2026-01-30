import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, Clock, AlertCircle, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { GlowingOrb } from '@/components/ui/GlowingOrb'
import { VoiceVisualizer } from './VoiceVisualizer'
import { ConversationPanel } from './ConversationPanel'
import { ControlBar } from './ControlBar'
import { VoiceSelector } from './VoiceSelector'
import { useConversationStore } from '@/store/conversation-store'
import { getRealtimeClient } from '@/lib/openai-realtime'
import { getBusinessInfo } from '@/lib/context-builder'
import { formatTime } from '@/lib/utils'
import type { AIVoice } from '@/types'

export function VoiceAgent() {
  const {
    conversationState,
    voiceActivity,
    startTime,
    error,
    setConversationState,
    setVoiceActivity,
    addMessage,
    setLeadData,
    setSummary,
    startConversation,
    endConversation,
    setError,
    reset
  } = useConversationStore()

  const [audioLevel, setAudioLevel] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [pendingTranscript, setPendingTranscript] = useState('')
  const [selectedVoice, setSelectedVoice] = useState<AIVoice>('alloy')

  const businessInfo = getBusinessInfo()

  // Timer for elapsed time
  useEffect(() => {
    if (conversationState !== 'active' || !startTime) {
      return
    }

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [conversationState, startTime])

  // Setup realtime client handlers
  useEffect(() => {
    const client = getRealtimeClient()

    client.setHandlers({
      onConnecting: () => {
        setConversationState('connecting')
      },
      onConnected: () => {
        setConversationState('active')
        setVoiceActivity('listening')
      },
      onDisconnected: () => {
        if (conversationState !== 'ended') {
          endConversation()
        }
      },
      onError: (error) => {
        setError(error)
      },
      onSpeechStarted: () => {
        setVoiceActivity('listening')
      },
      onSpeechEnded: () => {
        setVoiceActivity('thinking')
        // Add user message when speech ends
        if (pendingTranscript) {
          addMessage({ role: 'user', content: pendingTranscript })
          setPendingTranscript('')
        }
      },
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          addMessage({ role: 'user', content: text })
          setPendingTranscript('')
        } else {
          setPendingTranscript(text)
        }
      },
      onResponseStarted: () => {
        setVoiceActivity('speaking')
      },
      onResponseText: (text, isFinal) => {
        if (isFinal) {
          addMessage({ role: 'assistant', content: text })
        }
      },
      onResponseEnded: () => {
        setVoiceActivity('listening')
      },
      onLeadCaptured: (lead) => {
        setLeadData(lead)
      },
      onSummaryGenerated: (summary) => {
        setSummary(summary)
      },
      onAudioLevel: (level) => {
        setAudioLevel(level)
      }
    })
  }, [conversationState, pendingTranscript])

  const handleStart = useCallback(async () => {
    startConversation()
    
    try {
      const client = getRealtimeClient()
      client.setVoice(selectedVoice)
      await client.connect()
    } catch (error) {
      console.error('Failed to start conversation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect'
      setError(errorMessage)
    }
  }, [startConversation, setError, selectedVoice])

  const handleEnd = useCallback(async () => {
    const client = getRealtimeClient()
    
    // Request the AI to finalize with lead capture and summary before disconnecting
    setVoiceActivity('thinking')
    await client.requestFinalSummary()
    
    client.disconnect()
    endConversation()
  }, [endConversation, setVoiceActivity])

  const getStatusText = () => {
    switch (conversationState) {
      case 'idle':
        return 'Ready to start'
      case 'connecting':
        return 'Connecting...'
      case 'active':
        switch (voiceActivity) {
          case 'listening':
            return 'Listening...'
          case 'speaking':
            return 'Speaking...'
          case 'thinking':
            return 'Processing...'
          default:
            return 'Connected'
        }
      case 'ended':
        return 'Call ended'
      case 'error':
        return 'Connection error'
      default:
        return ''
    }
  }

  return (
    <Card variant="glass" className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/25">
            A
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Aria <span className="text-slate-400 font-normal text-sm">AI Assistant</span>
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {businessInfo.name} • {businessInfo.tagline}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-2 text-sm">
            {conversationState === 'active' ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Connected</span>
              </>
            ) : conversationState === 'connecting' ? (
              <>
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Wifi className="w-4 h-4 text-amber-400" />
                </motion.div>
                <span className="text-amber-400">Connecting</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-slate-500" />
                <span className="text-slate-500">Offline</span>
              </>
            )}
          </div>

          {/* Timer */}
          {conversationState === 'active' && (
            <div className="flex items-center gap-1.5 text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">Connection Error</p>
                <p className="text-sm text-red-300/80 mt-1">{error}</p>
              </div>
              <button
                onClick={() => { setError(null); reset(); }}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main visualization area */}
      <div className="relative py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Glowing orb */}
          <AnimatePresence mode="wait">
            <motion.div
              key={voiceActivity}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <GlowingOrb 
                activity={voiceActivity} 
                audioLevel={audioLevel}
                size="lg"
              />
            </motion.div>
          </AnimatePresence>

          {/* Status text */}
          <motion.p
            key={getStatusText()}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-slate-300"
          >
            {getStatusText()}
          </motion.p>

          {/* Audio visualizer */}
          {conversationState === 'active' && (
            <VoiceVisualizer 
              activity={voiceActivity}
              audioLevel={audioLevel}
              className="w-64"
            />
          )}
        </div>
      </div>

      {/* Conversation panel */}
      <div className="border-t border-slate-800/50 pt-6 mb-6">
        <ConversationPanel />
      </div>

      {/* Voice selector - only show when idle */}
      {conversationState === 'idle' && (
        <div className="border-t border-slate-800/50 pt-4 pb-2">
          <VoiceSelector
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            disabled={conversationState !== 'idle'}
          />
        </div>
      )}

      {/* Control bar */}
      <div className="border-t border-slate-800/50 pt-6">
        <ControlBar
          conversationState={conversationState}
          onStart={handleStart}
          onEnd={handleEnd}
        />
      </div>
    </Card>
  )
}
