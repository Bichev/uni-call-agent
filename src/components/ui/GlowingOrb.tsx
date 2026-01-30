import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { VoiceActivity } from '@/types'

interface GlowingOrbProps {
  activity: VoiceActivity
  audioLevel?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function GlowingOrb({ 
  activity, 
  audioLevel = 0, 
  size = 'lg',
  className 
}: GlowingOrbProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  const getColor = () => {
    switch (activity) {
      case 'listening':
        return 'from-blue-500 to-cyan-400'
      case 'speaking':
        return 'from-purple-500 to-pink-400'
      case 'thinking':
        return 'from-amber-500 to-orange-400'
      default:
        return 'from-slate-600 to-slate-500'
    }
  }

  const getGlowColor = () => {
    switch (activity) {
      case 'listening':
        return 'rgba(59, 130, 246, 0.5)'
      case 'speaking':
        return 'rgba(168, 85, 247, 0.5)'
      case 'thinking':
        return 'rgba(245, 158, 11, 0.5)'
      default:
        return 'rgba(100, 116, 139, 0.3)'
    }
  }

  const scale = 1 + (audioLevel * 0.3)
  const isActive = activity !== 'idle'

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Outer glow rings */}
      {isActive && (
        <>
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full bg-gradient-to-r opacity-30',
              getColor()
            )}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full bg-gradient-to-r opacity-20',
              getColor()
            )}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.2, 0, 0.2]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5
            }}
          />
        </>
      )}

      {/* Main orb */}
      <motion.div
        className={cn(
          'absolute inset-0 rounded-full bg-gradient-to-br',
          getColor()
        )}
        animate={{
          scale: isActive ? scale : 1
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20
        }}
        style={{
          boxShadow: isActive 
            ? `0 0 30px ${getGlowColor()}, 0 0 60px ${getGlowColor()}, 0 0 90px ${getGlowColor()}`
            : 'none'
        }}
      />

      {/* Inner highlight */}
      <div 
        className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent"
        style={{ mixBlendMode: 'overlay' }}
      />

      {/* Activity indicator */}
      {activity === 'thinking' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-2 h-2 bg-white rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity
            }}
          />
        </div>
      )}
    </div>
  )
}
