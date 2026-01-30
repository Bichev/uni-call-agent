import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Upload, Check, User, Calendar, Tag, FileText } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useConversationStore } from '@/store/conversation-store'
import { formatDate } from '@/lib/utils'

export function CRMSimulation() {
  const { leadData, summary, simulation, setSimulationCRM } = useConversationStore()
  const [stage, setStage] = useState<'ready' | 'syncing' | 'complete'>('ready')
  const [progress, setProgress] = useState(0)

  const handleSyncCRM = async () => {
    setStage('syncing')
    
    // Animate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 150))
      setProgress(i)
    }
    
    const recordId = `CRM-${Date.now().toString(36).toUpperCase()}`
    setSimulationCRM(true, recordId)
    setStage('complete')
  }

  useEffect(() => {
    if (simulation.crm.recorded) {
      setStage('complete')
    }
  }, [simulation.crm.recorded])

  const crmFields = [
    { 
      icon: User, 
      label: 'Contact', 
      value: leadData?.name || 'Unknown',
      color: 'text-blue-400'
    },
    { 
      icon: Calendar, 
      label: 'Created', 
      value: formatDate(new Date()),
      color: 'text-green-400'
    },
    { 
      icon: Tag, 
      label: 'Interest', 
      value: leadData?.interest || 'General inquiry',
      color: 'text-purple-400'
    },
    { 
      icon: FileText, 
      label: 'Notes', 
      value: summary?.topicsDiscussed.join(', ') || 'Voice conversation',
      color: 'text-amber-400'
    }
  ]

  return (
    <Card variant="glass">
      <CardHeader>
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <Database className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <CardTitle>CRM Record</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">Sync to HubSpot/Salesforce</p>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* CRM preview */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
          {/* CRM header */}
          <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">New Lead Record</span>
            {simulation.crm.recordId && (
              <span className="text-xs text-slate-500 font-mono">
                {simulation.crm.recordId}
              </span>
            )}
          </div>

          {/* CRM fields */}
          <div className="p-4 space-y-3">
            <AnimatePresence>
              {crmFields.map((field, i) => (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: stage === 'syncing' && progress < (i + 1) * 25 ? 0.5 : 1,
                    x: 0 
                  }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <field.icon className={`w-4 h-4 ${field.color} mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">{field.label}</p>
                    <p className="text-sm text-white truncate">{field.value}</p>
                  </div>
                  {stage === 'complete' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <Check className="w-4 h-4 text-green-400" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          {stage === 'syncing' && (
            <div className="px-4 pb-4">
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-center text-slate-500 mt-2">
                Syncing to CRM... {progress}%
              </p>
            </div>
          )}

          {/* Success message */}
          {stage === 'complete' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="px-4 pb-4"
            >
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                <Check className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-sm text-green-400">Successfully synced to CRM</p>
                <p className="text-xs text-slate-500 mt-1">
                  Record created at {simulation.crm.timestamp ? formatDate(simulation.crm.timestamp) : 'now'}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sync button */}
        <div className="mt-4">
          <Button
            onClick={handleSyncCRM}
            disabled={stage !== 'ready'}
            className="w-full"
            variant={stage === 'ready' ? 'primary' : 'secondary'}
          >
            {stage === 'ready' ? (
              <>
                <Upload className="w-4 h-4" />
                Sync to CRM
              </>
            ) : stage === 'syncing' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Database className="w-4 h-4" />
              </motion.div>
            ) : (
              <>
                <Check className="w-4 h-4 text-green-400" />
                Synced to CRM
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
