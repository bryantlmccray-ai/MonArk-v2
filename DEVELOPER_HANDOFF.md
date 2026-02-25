# MonArk – Developer Handoff

## Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth, Postgres DB, Edge Functions, Realtime, Storage)
- **Animation:** Framer Motion
- **Validation:** Zod (`src/lib/validation.ts`)
- **State:** React Context + TanStack React Query

## Project Structure

```
src/
├── App.tsx                  # Router, providers (Auth, Demo, Query, Tooltip)
├── main.tsx                 # Entry point
├── index.css                # Design tokens (HSL CSS vars), global styles
├── pages/
│   ├── Index.tsx            # Main page – orchestrates splash → landing → auth → onboarding → profile → app
│   ├── Admin.tsx            # Admin dashboard
│   ├── AdminWaitlist.tsx    # Waitlist management
│   ├── AdminAnalytics.tsx   # KPI dashboard
│   ├── AdminMatchCuration.tsx # Manual match curation
│   ├── Privacy.tsx / Terms.tsx / CookiePolicy.tsx / ResetPassword.tsx
│   └── NotFound.tsx
├── components/
│   ├── splash/SplashScreen.tsx       # Animated intro (session-scoped)
│   ├── demo/EnhancedLandingPage.tsx  # Public landing page + waitlist
│   ├── demo/DemoMainApp.tsx          # Demo mode app shell
│   ├── demo/WaitlistModal.tsx        # Waitlist signup modal
│   ├── auth/AuthPage.tsx             # Login/signup
│   ├── onboarding/                   # Multi-step onboarding flow
│   │   ├── OnboardingFlow.tsx        # Flow controller
│   │   ├── OnboardingWelcome.tsx     # Welcome screen
│   │   ├── OnboardingDifference.tsx  # Value prop
│   │   ├── AffirmationScreen.tsx     # Mindset setting
│   │   ├── IntentScreen.tsx          # Dating intent
│   │   ├── DatingStyleQuiz.tsx       # RIF quiz (emoji-free)
│   │   ├── RIFIntro.tsx / RIFComplete.tsx  # RIF explanation
│   │   ├── BasicProfileStep.tsx      # Name, age
│   │   ├── SimplifiedIdentityStep.tsx / SimplifiedBioStep.tsx / SimplifiedInterestsStep.tsx / SimplifiedPhotosStep.tsx
│   │   ├── LocationStep.tsx / RelationshipGoalsStep.tsx / AgeVerificationStep.tsx
│   │   └── InviteScreen.tsx / FinalWelcomeScreen.tsx
│   ├── profile/                      # Profile creation & editing
│   │   ├── ProfileCreation.tsx       # Multi-step profile builder
│   │   ├── BioStep / PhotosStep / InterestsStep / LifestyleStep / etc.
│   │   ├── IdentityPreferencesSettings.tsx  # Gender/orientation prefs
│   │   └── ProfileCompleteScreen.tsx
│   ├── main/                         # Authenticated app shell
│   │   ├── MainApp.tsx               # Tab-based layout (weekly, circle, conversations, journal, profile)
│   │   ├── BottomNavigation.tsx      # Mobile nav
│   │   ├── SidebarNavigation.tsx     # Desktop nav
│   │   ├── MonArkCircle.tsx          # AI companion hub
│   │   ├── Conversations.tsx         # Chat list
│   │   ├── DatesJournal.tsx          # Date history
│   │   ├── Profile.tsx               # Profile view/edit
│   │   └── overlays/                 # Settings, Trust Score, Debrief
│   ├── matching/                     # Match system
│   │   ├── SundayMatches.tsx         # Weekly match delivery
│   │   ├── CuratedMatches.tsx        # Human-curated matches
│   │   ├── DatingPool.tsx            # Broader pool
│   │   └── MatchProfileCard.tsx / MatchDetailModal.tsx / MutualMatchModal.tsx
│   ├── chat/                         # Messaging
│   │   ├── ChatInterface.tsx         # Message thread
│   │   ├── ChatModal.tsx             # Chat overlay
│   │   ├── CloseTheLoopCard.tsx      # Conversation closure
│   │   └── MessagingLockCard.tsx     # Pre-match lock
│   ├── weekly/                       # Weekly rhythm plans
│   │   └── WeeklyRhythmPlans.tsx / WeeklyOptionsCard.tsx / WeeklyOptionsList.tsx
│   ├── ai/AICompanionChat.tsx        # AI dating companion
│   ├── date-concierge/              # AI date planning
│   │   └── AIConciergeModal.tsx / DateProposalCard.tsx / DateJournalEntry.tsx
│   ├── rif/                          # Relational Intelligence Framework
│   │   └── PostDateReflection.tsx / RifInsightsCard.tsx
│   ├── feedback/                     # Post-date feedback
│   │   └── AfterDateFeedback.tsx / ContactShareFeedback.tsx
│   ├── safety/                       # Safety features
│   │   └── ReportBlockModal.tsx / BlockedUsersModal.tsx / SafetySettingsModal.tsx / UserSafetyOverlay.tsx
│   ├── privacy/                      # GDPR/privacy
│   │   └── DataDeletionManager.tsx / DataMinimizationLogger.tsx / EnhancedConsentFlow.tsx / PrivacyDataPortal.tsx
│   ├── video/VideoCallModal.tsx      # Video dates
│   ├── social/                       # Shareable milestone cards
│   ├── analytics/                    # User analytics & consent
│   ├── location/LocationConsentModal.tsx
│   ├── legal/                        # Cookie consent, privacy policy, terms
│   ├── common/                       # Shared components
│   │   ├── ErrorBoundary.tsx / ErrorState.tsx / LoadingSpinner.tsx
│   │   └── AuthGuard.tsx / ProfileGate.tsx / ApiErrorFallback.tsx
│   ├── ui/                           # shadcn/ui primitives (do not edit directly)
│   └── MonArkLogo.tsx
├── hooks/
│   ├── useAuth.tsx                   # Auth context (Supabase + demo mode)
│   ├── useProfile.ts                 # User profile CRUD
│   ├── useSecurity.ts                # Rate limiting, input validation
│   ├── useMessages.ts / useConversations.ts / useTypingIndicator.ts
│   ├── useCuratedMatches.ts / useDatingPool.ts / useWeeklyOptions.ts
│   ├── useAICompanion.ts / useDateConcierge.ts / useItineraries.ts
│   ├── useRIF.ts / useRifBeta.ts     # Relational Intelligence
│   ├── useAfterDateFeedback.ts / useContactFeedback.ts / useContactSharing.ts
│   ├── useLocation.ts / useCityDiscovery.ts
│   ├── useAnalytics.ts / useMonthlyAnalytics.ts
│   ├── useNotifications.ts / useNotificationTriggers.ts
│   ├── useUserSafety.ts / useActionProtection.ts
│   ├── useAdmin.ts                   # Admin panel logic
│   ├── usePhotoUpload.ts             # Supabase storage uploads
│   ├── useRealTimePresence.ts        # Online status
│   ├── useConversationReadiness.ts / useJournalEngagement.ts
│   └── useTouchGestures.ts / use-mobile.tsx
├── contexts/
│   └── DemoContext.tsx               # Demo mode state
├── services/
│   └── AIInsightsService.ts          # AI insight generation
├── lib/
│   ├── utils.ts                      # cn() helper
│   └── validation.ts                 # Zod schemas (messages, profiles, security)
├── utils/
│   ├── retryUtils.ts                 # Exponential backoff
│   └── rifScoreMapping.ts            # RIF score calculations
└── integrations/supabase/
    ├── client.ts                     # Supabase client (PKCE auth, realtime)
    └── types.ts                      # Auto-generated DB types (READ-ONLY)
```

## Supabase Edge Functions

```
supabase/functions/
├── _shared/security.ts               # Shared CORS + auth helpers
├── ai-companion-chat/                # AI chat (JWT required)
├── ai-date-concierge/                # Date suggestion AI
├── adaptive-discovery-engine/        # Behavioral pattern engine
├── ml-compatibility-trainer/         # ML compatibility scoring
├── rif-engine/                       # Relational Intelligence processing
├── match-delivery/                   # Weekly match delivery
├── weekly-scheduler/                 # Cron-like scheduling
├── create-itinerary/                 # Date itinerary builder
├── share-contact/                    # Contact info sharing
├── check-date-feedback/              # Feedback triggers
├── send-notification-email/          # Email notifications
├── waitlist-confirmation-email/      # Waitlist emails (no JWT)
├── waitlist-approval-email/          # (no JWT)
├── waitlist-rejection-email/         # (no JWT)
├── google-maps-config/               # Maps API proxy
└── security-middleware/               # Rate limiting & access control
```

### JWT Configuration (`supabase/config.toml`)
- **JWT required:** ai-companion-chat, ai-date-concierge, ml-compatibility-trainer, rif-engine, send-notification-email, google-maps-config, weekly-scheduler, create-itinerary, adaptive-discovery-engine, match-delivery, share-contact, check-date-feedback, security-middleware
- **No JWT (public):** waitlist-confirmation-email, waitlist-approval-email, waitlist-rejection-email

## Database (Supabase Postgres)

### Key Tables

| Table | Purpose |
|-------|---------|
| `user_profiles` | Full user profile (bio, photos, interests, identity, location, RIF quiz, preferences) |
| `profiles` | Basic profile (name, email) – created on auth signup |
| `matches` | Like/match records with `is_mutual` flag |
| `curated_matches` | Human-curated weekly matches with compatibility scores |
| `dating_pool` | Broader match pool entries |
| `messages` | Chat messages between matched users |
| `date_proposals` | AI-generated or user-created date suggestions |
| `date_journal` | Date history with ratings and reflections |
| `date_reflections` | Post-date structured reflections |
| `itineraries` | Date plans with location, time, safety features |
| `itinerary_feedback` | Post-itinerary feedback |
| `contact_shares` | Contact info sharing between matches |
| `contact_share_feedback` | Feedback after contact exchange |
| `rif_profiles` | Relational Intelligence scores (emotional readiness, boundary respect, etc.) |
| `rif_reflections` | User responses to RIF prompts |
| `rif_insights` | AI-generated relationship insights |
| `rif_settings` | Per-user RIF preferences |
| `rif_prompts` | Prompt library for reflections |
| `rif_recommendations` | AI recommendations based on RIF data |
| `rif_feedback` | User feedback on RIF features |
| `rif_event_log` | RIF interaction tracking |
| `blocked_users` | Block list with reasons |
| `notifications` | In-app notifications |
| `notification_preferences` | Per-user notification settings |
| `conversation_tracker` | Conversation health metrics |
| `conversation_monitor` | Sentiment and activity monitoring |
| `conversation_events` | Chat event log |
| `behavior_analytics` | User behavior tracking |
| `behavioral_patterns` | Detected behavioral patterns |
| `adaptive_insights` | AI-generated adaptive insights |
| `user_ml_preferences` | ML model preference weights |
| `user_compatibility_feedback` | Explicit compatibility ratings |
| `user_journey_stages` | User lifecycle tracking |
| `relationship_outcomes` | Long-term relationship tracking |
| `match_conversions` | Match-to-date conversion funnel |
| `match_delivery_log` | Weekly match delivery records |
| `kpi_snapshots` | Admin KPI snapshots |
| `partner_email_submissions` | Waitlist signups |
| `cities` / `neighborhoods` | Location reference data |
| `nudge_library` | Conversation nudge templates |
| `security_audit_log` | Security event log |
| `rate_limits` | Rate limiting state |
| `user_actions` | Admin moderation actions |
| `curation_queue` | Match curation workflow |

All user-facing tables have **Row Level Security (RLS)** enabled. Migrations are in `supabase/migrations/` (read-only, do not edit).

## Auth Flow

1. **Splash** (`SplashScreen`) → Animated intro, session-scoped (shows once per browser session)
2. **Landing** (`EnhancedLandingPage`) → Public page with waitlist signup + "Try Demo" button
3. **Auth** (`AuthPage`) → Supabase email/password with PKCE flow
4. **Onboarding** (`OnboardingFlow`) → Multi-step intro including RIF dating style quiz
5. **Profile Creation** (`ProfileCreation`) → Bio, photos, interests, lifestyle, identity preferences
6. **Profile Complete** (`ProfileCompleteScreen`) → Transition screen
7. **Main App** (`MainApp`) → Tabbed interface (Weekly Rhythm, MonArk Circle, Conversations, Journal, Profile)

### Demo Mode
- Activated via landing page "Try Demo" button
- Creates a fake `User` object client-side (no Supabase calls)
- Managed by `useAuth.tsx` (`enterDemoMode` / `exitDemoMode`) and `DemoContext.tsx`
- Demo data is entirely client-side mock data

## Design System

### CSS Variables (src/index.css)
All colors are **HSL** values defined as CSS custom properties:

```css
:root {
  --background: ...;
  --foreground: ...;
  --primary: ...;
  --primary-foreground: ...;
  --secondary: ...;
  --muted: ...;
  --muted-foreground: ...;
  --accent: ...;
  --destructive: ...;
  --border: ...;
  --ring: ...;
  /* etc. */
}
```

### Rules
- **Never use raw color values** in components (no `text-white`, `bg-black`, `text-gray-500`)
- Always use semantic Tailwind classes: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, etc.
- All new colors must be added to both `index.css` and `tailwind.config.ts`
- Ensure proper contrast in both light and dark modes

### Tailwind Config
Extended in `tailwind.config.ts` to map CSS variables to Tailwind utility classes.

## Key Architectural Patterns

### Validation
- All edge function inputs validated with **Zod** schemas (`src/lib/validation.ts`)
- Schemas: `messageContentSchema`, `profileUpdateSchema`, `securityMiddlewareSchema`
- `getFirstError()` helper extracts first validation error message

### Error Handling
- `ErrorBoundary` wraps entire app (catches React render errors)
- `ApiErrorFallback` for API error states
- `retryUtils.ts` provides exponential backoff for network calls
- Auth errors handled gracefully (retry logic in `useAuth.tsx`)

### Security
- `useSecurity` hook for rate limiting checks + input validation
- `security-middleware` edge function enforces server-side rate limits
- `AuthGuard` component protects routes requiring authentication
- `ProfileGate` ensures profile completion before feature access
- `security_audit_log` table tracks security events
- CORS headers managed in `supabase/functions/_shared/security.ts`

### Real-time
- Supabase Realtime for presence (`useRealTimePresence`) and typing indicators (`useTypingIndicator`)
- Rate-limited to 2 events/second (`client.ts` config)

### Photo Upload
- `usePhotoUpload` hook handles Supabase Storage uploads
- Photos stored in Supabase Storage buckets

## Environment & Secrets

- **Publishable keys** (Supabase URL + anon key) are in `src/integrations/supabase/client.ts`
- **Private API keys** (AI services, email, maps) are stored as Supabase Edge Function secrets / Lovable Cloud secrets
- `.env` file for local development overrides

## Running Locally

```bash
git clone <repo-url>
cd <project-directory>
npm install
npm run dev
```

Requires **Node.js** (install via [nvm](https://github.com/nvm-sh/nvm)). The Supabase backend is cloud-hosted and connected automatically.

## Deployment

- **Preview:** Auto-deploys on every commit via Lovable
- **Production:** Publish via Lovable dashboard (Share → Publish)
- **Custom domain:** Configure in Project → Settings → Domains
- **Edge functions:** Auto-deployed with the project

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Supabase client |
| `@tanstack/react-query` | Server state management |
| `react-router-dom` | Client-side routing |
| `framer-motion` | Animations |
| `zod` | Schema validation |
| `react-hook-form` + `@hookform/resolvers` | Form handling |
| `lucide-react` | Icons |
| `recharts` | Charts (admin analytics) |
| `date-fns` | Date utilities |
| `sonner` | Toast notifications |
| `html2canvas` | Screenshot generation for shareable cards |
| `canvas-confetti` | Celebration animations |
| `@googlemaps/js-api-loader` | Google Maps integration |
