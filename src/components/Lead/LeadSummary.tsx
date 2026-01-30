import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Target, 
  MessageSquare, 
  HelpCircle,
  ListChecks,
  TrendingUp,
  Clock
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useConversationStore } from '@/store/conversation-store'
import { formatTime } from '@/lib/utils'

export function LeadSummary() {
  const { leadData, summary, messages } = useConversationStore()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid md:grid-cols-2 gap-6"
    >
      {/* Lead Information Card */}
      {leadData && (
        <motion.div variants={itemVariants}>
          <Card variant="elevated" glow="blue">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {leadData.name && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-white font-medium">{leadData.name}</span>
                </div>
              )}
              
              {leadData.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <a 
                    href={`mailto:${leadData.email}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {leadData.email}
                  </a>
                </div>
              )}
              
              {leadData.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <a 
                    href={`tel:${leadData.phone}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {leadData.phone}
                  </a>
                </div>
              )}
              
              {leadData.company && (
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-slate-500" />
                  <span>{leadData.company}</span>
                </div>
              )}
              
              {leadData.interest && (
                <div className="flex items-start gap-3 pt-2 border-t border-slate-700">
                  <Target className="w-4 h-4 text-slate-500 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wide">Interested In</span>
                    <p className="text-white mt-0.5">{leadData.interest}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Conversation Summary Card */}
      {summary && (
        <motion.div variants={itemVariants}>
          <Card variant="elevated" glow="purple">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-400" />
              </div>
              <CardTitle>Conversation Summary</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Stats row */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(summary.duration)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MessageSquare className="w-4 h-4" />
                  <span>{summary.messageCount || messages.length} messages</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${
                  summary.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                  summary.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  <TrendingUp className="w-3 h-3" />
                  <span className="capitalize">{summary.sentiment}</span>
                </div>
              </div>

              {/* Topics discussed */}
              {summary.topicsDiscussed.length > 0 && (
                <div>
                  <h4 className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3" />
                    Topics Discussed
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {summary.topicsDiscussed.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-slate-800 rounded-md text-xs text-slate-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key questions */}
              {summary.keyQuestions.length > 0 && (
                <div>
                  <h4 className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-3 h-3" />
                    Key Questions
                  </h4>
                  <ul className="space-y-1">
                    {summary.keyQuestions.map((question, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Follow-up actions */}
              {summary.followUpActions.length > 0 && (
                <div>
                  <h4 className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <ListChecks className="w-3 h-3" />
                    Follow-up Actions
                  </h4>
                  <ul className="space-y-1">
                    {summary.followUpActions.map((action, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-green-400">→</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
