import businessContext from '../../data/communikate_knowledge_base.json'
import type { ToolDefinition } from '../types'

/**
 * Builds the system prompt for the AI agent using the business context
 */
export function buildSystemPrompt(): string {
  const ctx = businessContext
  
  return `You are an AI voice assistant representing ${ctx.company_overview.brand_name} (${ctx.company_overview.legal_name}). You are having a real-time voice conversation with a potential client.

## Your Identity
- Company: ${ctx.company_overview.brand_name}
- Tagline: "${ctx.company_overview.tagline}"
- Phone: ${ctx.contact_information.phone}
- Website: ${ctx.contact_information.website}

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
4. Naturally gather lead information during the conversation (name, email, phone, company)
5. Reference specific services based on what the caller is interested in
6. Offer to schedule a free consultation when appropriate
7. End calls professionally with clear next steps

## Lead Capture
Throughout the conversation, naturally collect:
- Caller's name
- Email address
- Phone number (if not already known)
- Company name
- What services they're interested in
- Preferred contact method and time

When you have enough information, use the capture_lead function to save it.

## Handling Questions
Use the FAQ knowledge to answer common questions:
${ctx.faq_candidates.slice(0, 5).map(faq => 
  `Q: ${faq.question}\nA: ${faq.answer}`
).join('\n\n')}

Remember: You are on a voice call. Be natural, conversational, and helpful. Start by greeting the caller and asking how you can help them today.`
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
    website: businessContext.contact_information.website
  }
}
