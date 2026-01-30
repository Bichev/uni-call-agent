// Conversation States
export type ConversationState = 
  | 'idle' 
  | 'connecting' 
  | 'active' 
  | 'processing' 
  | 'ended' 
  | 'error'

// Voice Activity
export type VoiceActivity = 'idle' | 'listening' | 'speaking' | 'thinking'

// Available AI voices
export type AIVoice = 'alloy' | 'echo' | 'shimmer' | 'ash' | 'coral' | 'sage'

export const AI_VOICES: { id: AIVoice; name: string; description: string }[] = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral & balanced' },
  { id: 'ash', name: 'Ash', description: 'Warm & friendly' },
  { id: 'coral', name: 'Coral', description: 'Clear & professional' },
  { id: 'echo', name: 'Echo', description: 'Soft & calm' },
  { id: 'sage', name: 'Sage', description: 'Confident & articulate' },
  { id: 'shimmer', name: 'Shimmer', description: 'Bright & energetic' },
]

// Message in conversation
export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  audioUrl?: string
}

// Lead data captured during conversation
export interface LeadData {
  name?: string
  email?: string
  phone?: string
  company?: string
  interest?: string
  preferredContactMethod?: 'email' | 'phone' | 'sms'
  preferredTime?: string
  notes?: string
}

// Conversation summary
export interface ConversationSummary {
  topicsDiscussed: string[]
  keyQuestions: string[]
  followUpActions: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  duration: number // in seconds
  messageCount: number
}

// Session configuration for OpenAI Realtime
export interface SessionConfig {
  model: string
  voice: string
  instructions: string
  tools: ToolDefinition[]
  inputAudioTranscription?: {
    model: string
  }
}

// Tool definition for function calling
export interface ToolDefinition {
  type: 'function'
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, {
      type: string
      description: string
      enum?: string[]
    }>
    required?: string[]
  }
}

// API Token response
export interface TokenResponse {
  token: string
  expiresAt: number
}

// Business context from knowledge base
export interface BusinessContext {
  metadata: {
    source: string
    company_name: string
    scraped_date: string
  }
  company_overview: {
    legal_name: string
    brand_name: string
    tagline: string
    description: string
    value_proposition: string
  }
  contact_information: {
    phone: string
    website: string
    social_media: Record<string, string>
  }
  services: Record<string, {
    title: string
    description: string
  }>
  testimonials: Array<{
    author: string
    text: string
    date: string
  }>
  faq_candidates: Array<{
    question: string
    answer: string
  }>
}

// Simulation states
export interface SimulationState {
  sms: {
    sent: boolean
    recipient: string
    message: string
    timestamp?: Date
  }
  crm: {
    recorded: boolean
    recordId?: string
    timestamp?: Date
  }
}
