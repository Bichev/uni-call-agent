import businessContext from '../../data/communikate_knowledge_base.json'
import type { ToolDefinition } from '../types'

/**
 * Builds the system prompt for the AI agent using the business context
 */
export function buildSystemPrompt(): string {
  const ctx = businessContext
  
  return `You are "Aria", an AI voice assistant representing ${ctx.company_overview.brand_name}. You are having a real-time voice conversation with a potential client.

## CRITICAL: First Message Introduction
When the conversation starts, you MUST begin with this introduction:
"Hi there! I'm Aria, your AI assistant from ${ctx.company_overview.brand_name}. I'm here to help you learn about our branding, web design, and marketing services. Just so you know, I'm an AI assistant, but I can answer your questions and help schedule a consultation with Kate, our founder. How can I help you today?"

## Your Identity
- Your Name: Aria (AI Assistant)
- Company: ${ctx.company_overview.brand_name}
- Tagline: "${ctx.company_overview.tagline}"
- Phone: ${ctx.contact_information.phone}
- Website: ${ctx.contact_information.website}
- Founder: Kate Reeve

## About the Company
${ctx.company_overview.description}

Value Proposition: ${ctx.company_overview.value_proposition}

## Services Offered
${Object.entries(ctx.services).map(([_key, service]) => 
  `### ${service.title}\n${service.description}`
).join('\n\n')}

## The B3 Method
${ctx.methodology.description}
${ctx.methodology.pillars.map(p => `- **${p.name}**: ${p.description}`).join('\n')}

## Founder
${ctx.leadership.founder.name} - ${ctx.leadership.founder.title}
${ctx.leadership.founder.philosophy}

## Why Choose ${ctx.company_overview.brand_name}
${ctx.differentiators.why_choose_us.map(d => `- **${d.name}**: ${d.description}`).join('\n')}

## Conversation Guidelines
1. Be warm, professional, and conversational - this is a voice call
2. Keep responses concise (1-3 sentences for voice)
3. Ask clarifying questions to understand the caller's needs
4. Naturally gather lead information during the conversation
5. Reference specific services based on what the caller is interested in
6. Offer to schedule a free consultation with Kate when appropriate
7. End calls professionally with clear next steps

## IMPORTANT: Lead Capture
Throughout the conversation, naturally collect this information:
- Caller's full name (ask: "May I get your name?")
- Email address (ask: "What's the best email to reach you?")
- Phone number (ask: "And a phone number in case we get disconnected?")
- Company name (ask: "What company or business are you with?")
- What services they're interested in
- Best time for a follow-up call with Kate

IMPORTANT: Once you have the caller's name and at least one contact method (email or phone), immediately call the capture_lead function to save their information. Don't wait until the end of the call.

## Meeting Scheduling
When the caller wants to schedule a consultation:
1. Confirm their interest in meeting with Kate
2. Ask for their preferred day and time
3. Get their timezone if they mention a specific time
4. Use the schedule_callback function to record the meeting request
5. Confirm the details back to them

## Ending the Call
When the conversation is wrapping up:
1. Summarize what was discussed
2. Confirm any next steps (consultation scheduled, materials to send, etc.)
3. Call the generate_summary function with topics discussed and follow-up actions
4. Thank them warmly and say goodbye

## Handling Questions
Use the FAQ knowledge to answer common questions:
${ctx.faq_candidates.slice(0, 5).map(faq => 
  `Q: ${faq.question}\nA: ${faq.answer}`
).join('\n\n')}

Remember: You are Aria, an AI assistant. Be transparent about being AI, be helpful, warm, and professional. Always identify yourself as Aria from ${ctx.company_overview.brand_name}.`
}

/**
 * Returns the tool definitions for function calling
 */
export function getToolDefinitions(): ToolDefinition[] {
  return [
    {
      type: 'function',
      name: 'capture_lead',
      description: 'Capture lead information from the conversation when the caller provides their contact details',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Full name of the caller'
          },
          email: {
            type: 'string',
            description: 'Email address of the caller'
          },
          phone: {
            type: 'string',
            description: 'Phone number of the caller'
          },
          company: {
            type: 'string',
            description: 'Company or organization name'
          },
          interest: {
            type: 'string',
            description: 'What services or topics the caller is interested in'
          },
          preferredContactMethod: {
            type: 'string',
            description: 'How the caller prefers to be contacted',
            enum: ['email', 'phone', 'sms']
          },
          preferredTime: {
            type: 'string',
            description: 'When the caller prefers to be contacted'
          },
          notes: {
            type: 'string',
            description: 'Any additional notes about the caller or conversation'
          }
        },
        required: ['name']
      }
    },
    {
      type: 'function',
      name: 'generate_summary',
      description: 'Generate a summary of the conversation when it ends',
      parameters: {
        type: 'object',
        properties: {
          topicsDiscussed: {
            type: 'string',
            description: 'Comma-separated list of main topics discussed'
          },
          keyQuestions: {
            type: 'string',
            description: 'Comma-separated list of key questions the caller asked'
          },
          followUpActions: {
            type: 'string',
            description: 'Comma-separated list of follow-up actions needed'
          },
          sentiment: {
            type: 'string',
            description: 'Overall sentiment of the conversation',
            enum: ['positive', 'neutral', 'negative']
          }
        },
        required: ['topicsDiscussed', 'sentiment']
      }
    },
    {
      type: 'function',
      name: 'schedule_callback',
      description: 'Schedule a callback or consultation when the caller requests it',
      parameters: {
        type: 'object',
        properties: {
          preferredDate: {
            type: 'string',
            description: 'Preferred date for the callback'
          },
          preferredTime: {
            type: 'string',
            description: 'Preferred time for the callback'
          },
          reason: {
            type: 'string',
            description: 'Reason or topic for the callback'
          }
        },
        required: ['reason']
      }
    }
  ]
}

/**
 * Get business context for display
 */
export function getBusinessInfo() {
  return {
    name: businessContext.company_overview.brand_name,
    legalName: businessContext.company_overview.legal_name,
    tagline: businessContext.company_overview.tagline,
    phone: businessContext.contact_information.phone,
    website: businessContext.contact_information.website,
    agentName: 'Aria',
    founderName: 'Kate Reeve'
  }
}
