# Voice Agent Demo

A stunning, single-page PWA that demonstrates AI voice agent capabilities for businesses. Real-time voice conversations with an AI trained on business context, featuring lead capture and CRM simulation.

![Voice Agent Demo](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![OpenAI](https://img.shields.io/badge/OpenAI-Realtime%20API-412991)

## Features

- **Real-time Voice Conversations** - Sub-200ms latency using OpenAI Realtime API with WebRTC
- **Business Context Awareness** - AI trained on scraped business knowledge base
- **Beautiful Dark Theme** - Modern, professional UI with Framer Motion animations
- **Lead Capture** - Automatic extraction of contact information during conversation
- **Conversation Summary** - AI-generated summary of topics discussed and follow-up actions
- **SMS & CRM Simulation** - Visual demonstration of integration capabilities
- **PWA Ready** - Installable as a progressive web app

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| State Management | Zustand |
| Voice AI | OpenAI Realtime API (WebRTC) |
| Hosting | Vercel |
| Icons | Lucide React |

## Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API key with Realtime API access

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/uni-call-agent.git
cd uni-call-agent

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add `OPENAI_API_KEY` to environment variables
4. Deploy

Or use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Project Structure

```
uni-call-agent/
├── api/                    # Vercel Edge Functions
│   └── token.ts           # OpenAI ephemeral token generation
├── data/                   # Business context data
│   ├── communikate_knowledge_base.json
│   └── communikate_knowledge_base.md
├── public/                 # Static assets
│   ├── icons/             # PWA icons
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── VoiceAgent/    # Main voice interface components
│   │   ├── Lead/          # Lead capture and display
│   │   ├── Simulation/    # SMS/CRM simulations
│   │   └── ui/            # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and API clients
│   ├── store/             # Zustand state management
│   └── types/             # TypeScript type definitions
└── vercel.json            # Vercel configuration
```

## How It Works

### Voice Flow

1. User clicks "Start Call" button
2. App requests ephemeral token from `/api/token`
3. WebRTC connection established with OpenAI Realtime API
4. Voice audio streams bidirectionally
5. AI responds using business context knowledge
6. Conversation transcript displayed in real-time
7. Lead data extracted via function calling
8. Summary generated when call ends

### Business Context

The AI is trained on the business knowledge base stored in `data/communikate_knowledge_base.json`. This includes:

- Company information and services
- Pricing and packages
- FAQs and common questions
- Team and founder information
- Testimonials and case studies

To use with a different business:
1. Scrape your website using Firecrawl or similar
2. Structure the data in JSON format
3. Replace the knowledge base files
4. Update the system prompt in `src/lib/context-builder.ts`

## Cost Estimation

| Component | Cost |
|-----------|------|
| Vercel Hosting | Free tier (100GB bandwidth) |
| OpenAI Realtime API | ~$0.10-0.50 per 5-min call |
| **100 demo calls** | **~$10-50 total** |

## Customization

### Theming

Edit `src/index.css` to customize:
- Color palette (CSS variables)
- Glow effects
- Animation timings

### Voice Persona

In `src/lib/context-builder.ts`:
- Modify system prompt
- Change voice selection (alloy, echo, fable, onyx, nova, shimmer)
- Adjust conversation guidelines

### UI Components

All components in `src/components/ui/` are fully customizable:
- Button variants and sizes
- Card styles and glow effects
- Input styling

## Browser Support

- Chrome 90+ (recommended)
- Firefox 90+
- Safari 15+
- Edge 90+

Note: WebRTC and Web Audio API required for voice functionality.

## Troubleshooting

### "Failed to get session token"
- Verify `OPENAI_API_KEY` is set correctly
- Check API key has Realtime API access

### No audio output
- Check browser microphone permissions
- Ensure HTTPS is used (required for WebRTC)
- Try refreshing the page

### High latency
- Check network connection
- Ensure no VPN interference
- Try a different browser

## Future Development

See [FUTURE_VISION.md](./FUTURE_VISION.md) for the complete roadmap including:
- Real SMS/CRM integrations
- Multi-tenant platform
- Advanced AI features
- Enterprise capabilities

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

- [OpenAI](https://openai.com) - Realtime API
- [Vercel](https://vercel.com) - Hosting and Edge Functions
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide](https://lucide.dev) - Icons

---

Built with care for demonstrating the future of AI voice interactions.
