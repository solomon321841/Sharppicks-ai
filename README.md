# SharpPicks AI

AI-powered sports betting parlay generator. Get daily automated picks and build custom parlays with real-time odds, market consensus, and closing line value tracking.

## What it does

- **Daily AI Picks** — 4 automated parlays every day (Safe, Balanced, Risky, Lotto) across NBA, NFL, NHL, MLB, and Soccer
- **Custom Parlay Builder** — Choose your sports, risk level, number of legs, and bet types. AI analyzes live odds + stats to generate picks
- **Bet Tracking** — Record your bets, track results, and monitor ROI over time
- **Line Shopping** — Compares odds across sportsbooks to find the best value
- **Closing Line Value** — Tracks whether picks beat the market at game time

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | Supabase Auth (Google, Apple SSO) |
| AI | Anthropic Claude API |
| Odds Data | The Odds API |
| Stats | ESPN API |
| Payments | Stripe |
| Email | Resend |
| Monitoring | Sentry |
| Hosting | Vercel |
| UI | Tailwind CSS, Radix UI, Framer Motion |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account)
- API keys for: Anthropic, The Odds API, Stripe, Supabase, Resend, Sentry

### Setup

```bash
# Clone the repo
git clone https://github.com/solomon321841/Sharppicks-ai.git
cd Sharppicks-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your API keys (see Environment Variables below)

# Set up the database
npx prisma generate
npx prisma db push

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# AI
ANTHROPIC_API_KEY=

# Odds Data
ODDS_API_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER=
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=
NEXT_PUBLIC_STRIPE_PRICE_ID_WHALE=

# Database (Prisma)
DATABASE_URL=
DIRECT_URL=

# Email
RESEND_API_KEY=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Cron
CRON_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
app/
├── (auth)/          # Login, OAuth callback
├── api/
│   ├── cron/        # Daily pick generation, result checking
│   ├── stripe/      # Checkout, billing portal
│   ├── webhooks/    # Stripe webhooks
│   ├── generate-parlay/
│   ├── daily-picks/
│   ├── track-bet/
│   └── bet-history/
├── dashboard/       # Main app hub
├── build-parlay/    # Custom parlay builder
├── daily-picks/     # Today's AI picks
├── bet-history/     # Bet tracking & analytics
└── settings/        # Subscription management

lib/
├── ai/              # Parlay generation, AI analysis
├── audit/           # Bet grading, CLV calculation
├── odds/            # Odds API, line shopping, scores
├── stats/           # ESPN client, stat parsers
├── config/          # Tier definitions
├── email/           # Resend email templates
├── supabase/        # Auth client, middleware
└── stripe/          # Stripe server client
```

## Subscription Tiers

| Feature | Free | Starter ($9/mo) | Pro ($24/mo) | Whale ($49/mo) |
|---------|------|------------------|--------------|-----------------|
| Daily AI Picks | 1/day | 3/day | All 4/day | All 4/day |
| Custom Builder | 3 credits | — | 50/month | 500/month |
| Bet Tracking | — | Basic | Full | Full |
| Player Props | — | — | Yes | Yes |
| All Sports | — | — | Yes | Yes |

## Cron Jobs

Two Vercel cron jobs run automatically:

- **Generate Daily Picks** — `0 14 * * *` (2 PM UTC / 9 AM EST)
- **Check Results** — `0 9 * * *` (9 AM UTC / grades completed games)

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Build for production (runs prisma generate first)
npm run start      # Start production server
npm run lint       # Run ESLint
```

## License

Private. All rights reserved.
