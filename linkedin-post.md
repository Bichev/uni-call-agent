# Open-source AI voice agent architecture — deploy for any business by swapping one JSON file

We built a production-ready AI voice agent on OpenAI Realtime API + WebRTC. Full lead qualification, CRM sync, SMS follow-up. One codebase, unlimited deployments.

Here's the architecture, real cost math, and where it sits against current market leaders.

---

**The stack:**

WebRTC → OpenAI Realtime API → Vercel Edge Functions → CRM/SMS hooks

Single React app. One serverless function for token auth. Business context loaded from a JSON knowledge base. Swap the file — new client, new agent. Same infrastructure.

**Per-call cost (5-minute conversation):**

| Layer | Cost |
|-------|------|
| OpenAI Realtime audio (in + out) | $0.75–1.00 |
| Twilio inbound voice (optional) | $0.04 |
| Twilio SMS follow-up | $0.008 |
| Vercel Edge | $0.00 |
| **Browser-only (WebRTC)** | **$0.75–1.00** |
| **With phone number + SMS** | **$0.80–1.05** |

**How this compares to AI receptionist platforms:**

| | This build | Goodcall | Smith.ai | Synthflow |
|--|-----------|----------|----------|-----------|
| 100 calls/mo | ~$80–100 | $59 | $95+ | $29+ |
| 500 calls/mo | ~$400–500 | $199 | $400+ | $375+ |
| 1,000 calls/mo | ~$800–1,050 | $199* | $800+ | $1,250 |
| White-label | included | — | — | $1,250/mo |
| Per-tenant fee | $0 | $59–199 | $95–800 | $375+ |

*Goodcall caps unique customers per tier.

For a single business, flat-rate platforms are the right choice. They've optimized for exactly that.

**The math changes when you deploy across clients.**

Ten businesses on a platform = 10× the subscription. Ten businesses on this architecture = the same infrastructure with only per-call API costs.

An agency deploying for 10 clients at ~200 calls each:
- Platform route: $590–1,990/mo in subscriptions alone
- This build: ~$1,500–2,000/mo total (API costs only, zero platform fees)
- White-label on a platform: add $3,750–12,500/mo

At 20+ clients the gap compounds. Every new deployment is a JSON file, a Vercel project, and the same codebase.

**What the agent handles per call:**

- Introduces itself, discloses AI status upfront
- Answers from loaded knowledge base — services, pricing, FAQs
- Captures name, email, phone, company mid-conversation
- Schedules consultations
- Generates call summary with sentiment and next steps
- Triggers SMS confirmation and CRM record

All through OpenAI function calling. No intent training. No dialog configuration.

**Other advantages over managed platforms:**

- **Browser-native.** WebRTC runs in any browser — embed on a client's website, a kiosk, a mobile app. No phone system required.
- **Full data ownership.** Transcripts, leads, recordings — all yours. No export limits, no vendor database.
- **Model-flexible.** When OpenAI releases cheaper models, costs drop immediately. No waiting for a platform to adjust pricing.

**Built in a weekend. Architecture is open.**

Live demo → [your-demo-link-here]

---

*#AIVoiceAgent #OpenAI #RealtimeAPI #WebRTC #ConversationalAI #VoiceAI #BuildInPublic*
