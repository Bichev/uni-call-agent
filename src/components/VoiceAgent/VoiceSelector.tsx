import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { AI_VOICES, type AIVoice } from '@/types'

interface VoiceSelectorProps {
  selectedVoice: AIVoice
  onVoiceChange: (voice: AIVoice) => void
  disabled?: boolean
}

export function VoiceSelector({ selectedVoice, onVoiceChange, disabled }: VoiceSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Volume2 className="w-4 h-4" />
        <span>Aria's Voice</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {AI_VOICES.map((voice) => (
          <motion.button
            key={voice.id}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={() => !disabled && onVoiceChange(voice.id)}
            disabled={disabled}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${selectedVoice === voice.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={voice.description}
          >
            {voice.name}
          </motion.button>
        ))}
      </div>
      
      <p className="text-xs text-slate-500">
        {AI_VOICES.find(v => v.id === selectedVoice)?.description}
      </p>
    </div>
  )
}
