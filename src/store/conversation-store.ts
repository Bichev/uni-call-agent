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
  
  // Common words that should NOT be treated as names
  const notNames = new Set([
    'yes', 'no', 'ok', 'okay', 'sure', 'thanks', 'thank', 'you', 'please', 'hello', 'hi',
    'good', 'great', 'fine', 'well', 'her', 'him', 'them', 'tomorrow', 'today', 'now',
    'here', 'there', 'this', 'that', 'the', 'sorry', 'interested', 'call', 'back',
    'morning', 'afternoon', 'evening', 'night', 'time', 'available', 'free', 'busy'
  ])
  
  // Try to extract name (look for patterns like "I'm X", "my name is X", "this is X")
  const namePatterns = [
    /(?:my name is|i'm|i am|this is|call me)\s+([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?)/i,
    /(?:it's|it is)\s+([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?)\s+(?:here|speaking|calling)/i,
  ]
  
  for (const pattern of namePatterns) {
    const match = userMessages.match(pattern)
    if (match && match[1]) {
      const potentialName = match[1].trim()
      // Validate: at least 2 chars, not a common word, starts with capital
      const firstWord = potentialName.split(' ')[0].toLowerCase()
      if (potentialName.length >= 2 && !notNames.has(firstWord)) {
        lead.name = potentialName
        break
      }
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

/**
 * Generate a basic summary from messages as fallback
 */
function generateSummaryFromMessages(messages: ConversationMessage[]): Partial<ConversationSummary> {
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase())
  const allText = userMessages.join(' ')
  
  const topics: string[] = []
  const followUps: string[] = []
  
  // Detect topics from keywords
  if (allText.includes('brand') || allText.includes('logo')) topics.push('branding')
  if (allText.includes('web') || allText.includes('site')) topics.push('web design')
  if (allText.includes('market') || allText.includes('advertis')) topics.push('marketing')
  if (allText.includes('consult') || allText.includes('meeting') || allText.includes('schedule')) {
    topics.push('consultation')
    followUps.push('schedule consultation with Sarah')
  }
  if (allText.includes('price') || allText.includes('cost') || allText.includes('quote')) {
    topics.push('pricing')
    followUps.push('send pricing information')
  }
  
  // Detect sentiment
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
  const positiveWords = ['yes', 'great', 'perfect', 'awesome', 'thanks', 'thank you', 'sounds good', 'interested']
  const negativeWords = ['no', 'not interested', 'too expensive', 'cancel']
  
  const positiveCount = positiveWords.filter(w => allText.includes(w)).length
  const negativeCount = negativeWords.filter(w => allText.includes(w)).length
  
  if (positiveCount > negativeCount) sentiment = 'positive'
  else if (negativeCount > positiveCount) sentiment = 'negative'
  
  return {
    topicsDiscussed: topics.length > 0 ? topics : ['general inquiry'],
    followUpActions: followUps,
    sentiment
  }
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
        
        // Generate fallback summary from messages
        const fallbackSummary = generateSummaryFromMessages(state.messages)
        
        // Update existing summary with actual duration/message count, or use fallback
        const updatedSummary = state.summary 
          ? {
              ...state.summary,
              // Only use fallback values if AI didn't provide them
              topicsDiscussed: state.summary.topicsDiscussed?.length > 0 
                ? state.summary.topicsDiscussed 
                : fallbackSummary.topicsDiscussed || [],
              followUpActions: state.summary.followUpActions?.length > 0 
                ? state.summary.followUpActions 
                : fallbackSummary.followUpActions || [],
              sentiment: state.summary.sentiment || fallbackSummary.sentiment || 'neutral',
              duration,
              messageCount: state.messages.length
            }
          : {
              topicsDiscussed: fallbackSummary.topicsDiscussed || [],
              keyQuestions: [],
              followUpActions: fallbackSummary.followUpActions || [],
              sentiment: fallbackSummary.sentiment || 'neutral' as const,
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
