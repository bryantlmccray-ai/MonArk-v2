# MonArk

Relationship wellness platform — a premium dating app focused on intentional connection.

**Live app:** https://lovable.dev/projects/f278e5cf-2518-488d-bb35-172e4505688f

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth, Postgres, Edge Functions, Realtime, Storage) |
| AI | OpenAI gpt-4o-mini — individual stateless API calls |
| Payments | RevenueCat subscription sync |
| Maps | Google Maps Platform |

## AI Architecture

MonArk uses **AI-powered features** — not agentic AI or LLM orchestration frameworks.

There is no LangChain, LlamaIndex, CrewAI, or any multi-agent system in this codebase. AI is invoked through individual, stateless OpenAI calls from Supabase edge functions.

### AI-powered edge functions

| Function | AI Usage |
|----------|----------|
| ai-match-curator | Single GPT-4o-mini call per match pair (deterministic fallback) |
| ai-companion-chat | Single GPT call per message |
| ai-date-concierge | Single GPT call for itinerary suggestions |
| analyze-conversation-signals | Single GPT call for sentiment/signals |

### Non-AI rule/weight-based functions

| Function | What it does |
|----------|--------------|
| rif-engine | Deterministic RIF scoring — no OpenAI |
| ml-compatibility-trainer | Rule-based feedback weight adjustment — no trained model |

## The RIF

The RIF (Relationship Intention Framework) is a **15-question structured assessment**, not a machine-learning model. It measures readiness across 5 dimensions: intent clarity, pacing preferences, emotional readiness, boundary respect, and post-date alignment. Scoring is **deterministic**. No embedding model, vector DB, or model versioning.

## Development

    git clone https://github.com/bryantlmccray-ai/MonArk-v2.git
    cd MonArk-v2
    npm install
    npm run dev

See [DEVELOPER_HANDOFF.md](./DEVELOPER_HANDOFF.md) for full architecture docs.
