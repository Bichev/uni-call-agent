import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { VoiceActivity } from '@/types'

interface VoiceVisualizerProps {
  activity: VoiceActivity
  audioLevel: number
  className?: string
}

export function VoiceVisualizer({ activity, audioLevel, className }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const barsRef = useRef<number[]>(Array(32).fill(0))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const width = canvas.width
      const height = canvas.height
      const barCount = 32
      const barWidth = width / barCount - 2
      const barGap = 2

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Update bars based on activity and audio level
      for (let i = 0; i < barCount; i++) {
        const targetHeight = activity === 'idle' 
          ? height * 0.1
          : activity === 'thinking'
            ? height * (0.2 + Math.sin(Date.now() / 200 + i * 0.3) * 0.1)
            : height * (0.15 + audioLevel * Math.random() * 0.7)

        // Smooth interpolation
        barsRef.current[i] += (targetHeight - barsRef.current[i]) * 0.15
      }

      // Draw bars
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + barGap)
        const barHeight = barsRef.current[i]
        const y = (height - barHeight) / 2

        // Create gradient
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
        
        if (activity === 'listening') {
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)')
          gradient.addColorStop(1, 'rgba(6, 182, 212, 0.8)')
        } else if (activity === 'speaking') {
          gradient.addColorStop(0, 'rgba(168, 85, 247, 0.8)')
          gradient.addColorStop(1, 'rgba(236, 72, 153, 0.8)')
        } else if (activity === 'thinking') {
          gradient.addColorStop(0, 'rgba(245, 158, 11, 0.8)')
          gradient.addColorStop(1, 'rgba(249, 115, 22, 0.8)')
        } else {
          gradient.addColorStop(0, 'rgba(100, 116, 139, 0.5)')
          gradient.addColorStop(1, 'rgba(71, 85, 105, 0.5)')
        }

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, 2)
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [activity, audioLevel])

  return (
    <motion.div 
      className={cn('relative', className)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        width={256}
        height={64}
        className="w-full h-16"
      />
    </motion.div>
  )
}

// Alternative: Simple bar visualizer
export function SimpleVisualizer({ 
  activity, 
  audioLevel,
  barCount = 5
}: { 
  activity: VoiceActivity
  audioLevel: number 
  barCount?: number
}) {
  const getBarHeight = (index: number) => {
    if (activity === 'idle') return 20

    const baseHeight = 20
    const maxHeight = 100
    const variation = Math.sin(Date.now() / 100 + index * 0.5)
    
    return baseHeight + (audioLevel * (maxHeight - baseHeight) * (0.5 + variation * 0.5))
  }

  const getColor = () => {
    switch (activity) {
      case 'listening': return 'bg-blue-500'
      case 'speaking': return 'bg-purple-500'
      case 'thinking': return 'bg-amber-500'
      default: return 'bg-slate-600'
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className={cn('w-1.5 rounded-full', getColor())}
          animate={{
            height: getBarHeight(i),
            opacity: activity === 'idle' ? 0.5 : 1
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
        />
      ))}
    </div>
  )
}
