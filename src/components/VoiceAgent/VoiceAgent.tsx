import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { GlowingOrb } from '@/components/ui/GlowingOrb'
import { VoiceVisualizer } from './VoiceVisualizer'
import { ConversationPanel } from './ConversationPanel'
import { ControlBar } from './ControlBar'
import { useConversationStore } from '@/store/conversation-store'
import { getRealtimeClient } from '@/lib/openai-realtime'
import { getBusinessInfo } from '@/lib/context-builder'
import { formatTime } from '@/lib/utils'

export function VoiceAgent() {
  const {
    conversationState,
    voiceActivity,
    startTime,
    setConversationState,
    setVoiceActivity,
    addMessage,
    setLeadData,
    setSummary,
    startConversation,
    endConversation,
    setError
  } = useConversationStore()

  const [audioLevel, setAudioLevel] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [pendingTranscript, setPendingTranscript] = useState('')

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
      await client.connect()
    } catch (error) {
      console.error('Failed to start conversation:', error)
    }
  }, [startConversation])

  const handleEnd = useCallback(() => {
    const client = getRealtimeClient()
    client.disconnect()
    endConversation()
  }, [endConversation])

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
        <div>
          <h2 className="text-xl font-semibold text-white">
            {businessInfo.name} Voice Agent
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {businessInfo.tagline}
          </p>
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
