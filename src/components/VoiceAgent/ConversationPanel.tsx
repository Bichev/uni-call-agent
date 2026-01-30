import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConversationStore } from '@/store/conversation-store'
import { formatDate } from '@/lib/utils'

export function ConversationPanel() {
  const { messages, voiceActivity } = useConversationStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-500">
        <Bot className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">Conversation will appear here</p>
      </div>
    )
  }

  return (
    <div 
      ref={scrollRef}
      className="h-64 overflow-y-auto space-y-4 pr-2 scrollbar-thin"
    >
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* Avatar */}
            <div className={cn(
              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
              message.role === 'user' 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'bg-purple-500/20 text-purple-400'
            )}>
              {message.role === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            {/* Message content */}
            <div className={cn(
              'flex-1 max-w-[80%]',
              message.role === 'user' ? 'text-right' : 'text-left'
            )}>
              <div className={cn(
                'inline-block px-4 py-2 rounded-2xl text-sm',
                message.role === 'user'
                  ? 'bg-blue-500/20 text-blue-100 rounded-tr-sm'
                  : 'bg-slate-800 text-slate-200 rounded-tl-sm'
              )}>
                {message.content}
              </div>
              <div className="text-xs text-slate-600 mt-1 px-1">
                {formatDate(message.timestamp)}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Typing indicator */}
      {voiceActivity === 'thinking' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-2xl rounded-tl-sm">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-slate-500 rounded-full"
                  animate={{
                    y: [0, -4, 0]
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
