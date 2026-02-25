import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Check, CheckCheck, Smartphone } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useConversationStore } from '@/store/conversation-store'

export function SMSSimulation() {
  const { leadData, simulation, setSimulationSMS } = useConversationStore()
  const [stage, setStage] = useState<'ready' | 'sending' | 'delivered' | 'read'>('ready')

  const recipientPhone = leadData?.phone || '+1 (555) 123-4567'
  const recipientName = leadData?.name || 'Customer'

  const smsMessage = `Hi ${recipientName}! Thanks for speaking with Zenith Creative today. As discussed, we'll follow up with more information about our ${leadData?.interest || 'services'}. Looking forward to connecting soon! - Sarah`

  const handleSendSMS = async () => {
    setStage('sending')
    
    // Simulate sending animation
    await new Promise(resolve => setTimeout(resolve, 1500))
    setStage('delivered')
    setSimulationSMS(true, recipientPhone, smsMessage)
    
    // Simulate read receipt
    await new Promise(resolve => setTimeout(resolve, 2000))
    setStage('read')
  }

  useEffect(() => {
    if (simulation.sms.sent) {
      setStage('read')
    }
  }, [simulation.sms.sent])

  return (
    <Card variant="glass">
      <CardHeader>
        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <CardTitle>SMS Follow-up</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">Send confirmation to client</p>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Phone mockup */}
        <div className="relative bg-slate-900 rounded-2xl p-4 border border-slate-700">
          {/* Phone header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{recipientName}</p>
                <p className="text-xs text-slate-500">{recipientPhone}</p>
              </div>
            </div>
          </div>

          {/* Message bubble */}
          <AnimatePresence mode="wait">
            {stage === 'ready' ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-800 rounded-2xl rounded-tl-sm p-3 text-sm text-slate-300"
              >
                <p className="opacity-50 italic">Preview: {smsMessage.slice(0, 60)}...</p>
              </motion.div>
            ) : (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-green-600 rounded-2xl rounded-br-sm p-3 text-sm text-white ml-auto max-w-[90%]"
              >
                <p>{smsMessage}</p>
                <div className="flex items-center justify-end gap-1 mt-2 text-xs text-green-200">
                  <span>Now</span>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {stage === 'sending' ? (
                      <Check className="w-3 h-3" />
                    ) : stage === 'delivered' ? (
                      <CheckCheck className="w-3 h-3" />
                    ) : (
                      <CheckCheck className="w-3 h-3 text-blue-300" />
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status indicator */}
          {stage !== 'ready' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-3 text-xs text-slate-500"
            >
              {stage === 'sending' && 'Sending...'}
              {stage === 'delivered' && 'Delivered'}
              {stage === 'read' && (
                <span className="text-green-400">Read</span>
              )}
            </motion.div>
          )}
        </div>

        {/* Send button */}
        <div className="mt-4">
          <Button
            onClick={handleSendSMS}
            disabled={stage !== 'ready'}
            className="w-full"
            variant={stage === 'ready' ? 'primary' : 'secondary'}
          >
            {stage === 'ready' ? (
              <>
                <Send className="w-4 h-4" />
                Send SMS Follow-up
              </>
            ) : stage === 'sending' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Send className="w-4 h-4" />
              </motion.div>
            ) : (
              <>
                <CheckCheck className="w-4 h-4 text-green-400" />
                SMS Sent
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
