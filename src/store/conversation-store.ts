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

/**
 * Extract lead information from conversation messages as a fallback
 */
function extractLeadFromMessages(messages: ConversationMessage[]): Partial<LeadData> {
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' ')
  
  const lead: Partial<LeadData> = {}
  
  // Extract email
  const emailMatch = userMessages.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i)
  if (emailMatch) {
    lead.email = emailMatch[0]
  }
  
  // Extract phone number (various formats)
  const phoneMatch = userMessages.match(/(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/i)
  if (phoneMatch) {
    lead.phone = phoneMatch[0]
  }
  
  // Try to extract name (look for patterns like "I'm X", "my name is X", "this is X")
  const namePatterns = [
    /(?:my name is|i'm|i am|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:here|speaking)/i,
  ]
  
  for (const pattern of namePatterns) {
    const match = userMessages.match(pattern)
    if (match && match[1]) {
      lead.name = match[1].trim()
      break
    }
  }
  
  // Try to extract company
  const companyPatterns = [
    /(?:from|with|at|work for|work at)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\.|,|$|\s+and|\s+I)/i,
    /(?:company is|business is)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\.|,|$)/i,
  ]
  
  for (const pattern of companyPatterns) {
    const match = userMessages.match(pattern)
    if (match && match[1] && match[1].length > 2 && match[1].length < 50) {
      lead.company = match[1].trim()
      break
    }
  }
  
  return lead
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
        
        // Update existing summary with actual duration/message count, or create default
        const updatedSummary = state.summary 
          ? {
              ...state.summary,
              duration,
              messageCount: state.messages.length
            }
          : {
              topicsDiscussed: [],
              keyQuestions: [],
              followUpActions: [],
              sentiment: 'neutral' as const,
              duration,
              messageCount: state.messages.length
            }
        
        // Fallback: try to extract lead info from conversation if not captured
        let leadData = state.leadData
        if (!leadData || (!leadData.name && !leadData.email && !leadData.phone)) {
          const extractedLead = extractLeadFromMessages(state.messages)
          if (extractedLead.name || extractedLead.email || extractedLead.phone) {
            leadData = { ...state.leadData, ...extractedLead }
          }
        }
        
        set({
          conversationState: 'ended',
          voiceActivity: 'idle',
          summary: updatedSummary,
          leadData
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
      }),
      // Handle Date serialization/deserialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          try {
            const data = JSON.parse(str)
            // Convert timestamp strings back to Date objects
            if (data.state?.messages) {
              data.state.messages = data.state.messages.map((msg: ConversationMessage) => ({
                ...msg,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
              }))
            }
            return data
          } catch {
            return null
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        }
      }
    }
  )
)
