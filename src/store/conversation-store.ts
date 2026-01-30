import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  ConversationState, 
  VoiceActivity, 
  ConversationMessage, 
  LeadData, 
  ConversationSummary,
  SimulationState
} from '../types'

interface ConversationStore {
  // State
  conversationState: ConversationState
  voiceActivity: VoiceActivity
  messages: ConversationMessage[]
  leadData: LeadData | null
  summary: ConversationSummary | null
  simulation: SimulationState
  error: string | null
  startTime: Date | null
  
  // Actions
  setConversationState: (state: ConversationState) => void
  setVoiceActivity: (activity: VoiceActivity) => void
  addMessage: (message: Omit<ConversationMessage, 'id' | 'timestamp'>) => void
  updateLastMessage: (content: string) => void
  setLeadData: (data: LeadData) => void
  setSummary: (summary: ConversationSummary) => void
  setSimulationSMS: (sent: boolean, recipient?: string, message?: string) => void
  setSimulationCRM: (recorded: boolean, recordId?: string) => void
  setError: (error: string | null) => void
  startConversation: () => void
  endConversation: () => void
  reset: () => void
}

const initialSimulation: SimulationState = {
  sms: { sent: false, recipient: '', message: '' },
  crm: { recorded: false }
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      conversationState: 'idle',
      voiceActivity: 'idle',
      messages: [],
      leadData: null,
      summary: null,
      simulation: initialSimulation,
      error: null,
      startTime: null,

      // Actions
      setConversationState: (conversationState) => set({ conversationState }),
      
      setVoiceActivity: (voiceActivity) => set({ voiceActivity }),
      
      addMessage: (message) => set((state) => ({
        messages: [
          ...state.messages,
          {
            ...message,
            id: crypto.randomUUID(),
            timestamp: new Date()
          }
        ]
      })),
      
      updateLastMessage: (content) => set((state) => {
        const messages = [...state.messages]
        if (messages.length > 0) {
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            content
          }
        }
        return { messages }
      }),
      
      setLeadData: (leadData) => set({ leadData }),
      
      setSummary: (summary) => set({ summary }),
      
      setSimulationSMS: (sent, recipient = '', message = '') => set((state) => ({
        simulation: {
          ...state.simulation,
          sms: { sent, recipient, message, timestamp: sent ? new Date() : undefined }
        }
      })),
      
      setSimulationCRM: (recorded, recordId) => set((state) => ({
        simulation: {
          ...state.simulation,
          crm: { recorded, recordId, timestamp: recorded ? new Date() : undefined }
        }
      })),
      
      setError: (error) => set({ error, conversationState: error ? 'error' : get().conversationState }),
      
      startConversation: () => set({
        conversationState: 'connecting',
        voiceActivity: 'idle',
        messages: [],
        leadData: null,
        summary: null,
        simulation: initialSimulation,
        error: null,
        startTime: new Date()
      }),
      
      endConversation: () => {
        const state = get()
        const duration = state.startTime 
          ? Math.floor((Date.now() - state.startTime.getTime()) / 1000)
          : 0
        
        set({
          conversationState: 'ended',
          voiceActivity: 'idle',
          summary: state.summary || {
            topicsDiscussed: [],
            keyQuestions: [],
            followUpActions: [],
            sentiment: 'neutral',
            duration,
            messageCount: state.messages.length
          }
        })
      },
      
      reset: () => set({
        conversationState: 'idle',
        voiceActivity: 'idle',
        messages: [],
        leadData: null,
        summary: null,
        simulation: initialSimulation,
        error: null,
        startTime: null
      })
    }),
    {
      name: 'voice-agent-conversation',
      partialize: (state) => ({
        messages: state.messages,
        leadData: state.leadData,
        summary: state.summary
      })
    }
  )
)
