import { motion } from 'framer-motion'
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { ConversationState } from '@/types'

interface ControlBarProps {
  conversationState: ConversationState
  onStart: () => void
  onEnd: () => void
  onMuteToggle?: (muted: boolean) => void
}

export function ControlBar({ 
  conversationState, 
  onStart, 
  onEnd,
  onMuteToggle 
}: ControlBarProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false)

  const isIdle = conversationState === 'idle'
  const isConnecting = conversationState === 'connecting'
  const isActive = conversationState === 'active'
  const isEnded = conversationState === 'ended'

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
    onMuteToggle?.(!isMuted)
  }

  return (
    <div className="flex items-center justify-center gap-3 md:gap-4">
      {/* Mute microphone button */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            variant="secondary"
            size="icon"
            onClick={handleMuteToggle}
            className={cn(
              'rounded-full w-10 h-10 md:w-12 md:h-12',
              isMuted && 'bg-red-500/20 border-red-500/50 text-red-400'
            )}
          >
            {isMuted ? (
              <MicOff className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <Mic className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </Button>
        </motion.div>
      )}

      {/* Main call button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {(isIdle || isEnded) ? (
          <Button
            onClick={onStart}
            className={cn(
              'rounded-full w-14 h-14 md:w-16 md:h-16 text-white',
              'bg-gradient-to-r from-green-500 to-emerald-500',
              'hover:from-green-600 hover:to-emerald-600',
              'shadow-lg shadow-green-500/30'
            )}
          >
            <Phone className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
        ) : isConnecting ? (
          <Button
            disabled
            className={cn(
              'rounded-full w-14 h-14 md:w-16 md:h-16 text-white',
              'bg-gradient-to-r from-amber-500 to-orange-500'
            )}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Phone className="w-5 h-5 md:w-6 md:h-6" />
            </motion.div>
          </Button>
        ) : (
          <Button
            onClick={onEnd}
            className={cn(
              'rounded-full w-14 h-14 md:w-16 md:h-16 text-white',
              'bg-gradient-to-r from-red-500 to-rose-500',
              'hover:from-red-600 hover:to-rose-600',
              'shadow-lg shadow-red-500/30'
            )}
          >
            <PhoneOff className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
        )}
      </motion.div>

      {/* Speaker mute button */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
            className={cn(
              'rounded-full w-10 h-10 md:w-12 md:h-12',
              isSpeakerMuted && 'bg-red-500/20 border-red-500/50 text-red-400'
            )}
          >
            {isSpeakerMuted ? (
              <VolumeX className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </Button>
        </motion.div>
      )}
    </div>
  )
}
