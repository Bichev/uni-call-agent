import { VoiceAgent } from './components/VoiceAgent/VoiceAgent'
import { LeadSummary } from './components/Lead/LeadSummary'
import { SMSSimulation } from './components/Simulation/SMSSimulation'
import { CRMSimulation } from './components/Simulation/CRMSimulation'
import { useConversationStore } from './store/conversation-store'
import { Sparkles, Zap } from 'lucide-react'

function App() {
  const { conversationState, leadData, summary } = useConversationStore()
  const showResults = conversationState === 'ended' && (leadData || summary)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-500/5 to-transparent rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur opacity-30" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Voice Agent Demo</h1>
              <p className="text-xs text-slate-400">Powered by OpenAI Realtime</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>CommuniKATE Context</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Voice Agent Section */}
          <VoiceAgent />

          {/* Results Section - Shows after conversation ends */}
          {showResults && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Lead Summary */}
              {(leadData || summary) && <LeadSummary />}

              {/* Simulation Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                <SMSSimulation />
                <CRMSimulation />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto text-center text-sm text-slate-500">
          <p>Demo prototype - Voice conversations with AI business context</p>
        </div>
      </footer>
    </div>
  )
}

export default App
