import { VoiceAgent } from './components/VoiceAgent/VoiceAgent'
import { LeadSummary } from './components/Lead/LeadSummary'
import { SMSSimulation } from './components/Simulation/SMSSimulation'
import { CRMSimulation } from './components/Simulation/CRMSimulation'
import { useConversationStore } from './store/conversation-store'
import { Phone } from 'lucide-react'

function App() {
  const { conversationState, leadData, summary } = useConversationStore()
  const showResults = conversationState === 'ended' && (leadData || summary)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-64 md:w-96 h-64 md:h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-64 md:w-96 h-64 md:h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-gradient-radial from-teal-500/5 to-transparent rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 md:px-6 py-4 md:py-6 border-b border-slate-800/30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 md:gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow">
                <span className="text-white font-bold text-sm md:text-base tracking-tight">ZC</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base md:text-lg font-semibold text-white group-hover:text-teal-300 transition-colors">
                Zenith Creative
              </h1>
              <p className="text-[10px] md:text-xs text-slate-500">AI Voice Assistant Demo</p>
            </div>
          </div>

          {/* Center - Demo Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium">Live Demo</span>
          </div>

          {/* Right side - Phone */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs md:text-sm text-slate-400">
            <Phone className="w-3.5 h-3.5" />
            <span>555.987.6543</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-3 md:px-6 py-4 md:py-6 pb-6 md:pb-10">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {/* Voice Agent Section */}
          <VoiceAgent />

          {/* Results Section - Shows after conversation ends */}
          {showResults && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Lead Summary */}
              {(leadData || summary) && <LeadSummary />}

              {/* Simulation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SMSSimulation />
                <CRMSimulation />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-4 md:px-6 py-4 md:py-6 border-t border-slate-800/30">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <p className="text-xs md:text-sm text-slate-500">
            AI Voice Agent Prototype • Built with OpenAI Realtime API
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span>© 2026 Zenith Creative (Demo)</span>
            <span className="text-slate-700">Fictional brand for demonstration purposes</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
