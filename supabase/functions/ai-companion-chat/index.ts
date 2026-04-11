import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { sanitizeAIOutput } from '../_shared/security.ts'
import { sanitizeCompanionContext } from '../_shared/ai-sanitizer.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// ── Circuit Breaker ─────────────────────────────────────────
const circuitBreaker = {
  failures: 0,
  lastFailure: 0,
  state: 'closed' as 'closed' | 'open' | 'half-open',
  FAILURE_THRESHOLD: 3,
  RECOVERY_TIMEOUT: 60_000,
};

function checkCircuitBreaker(): boolean {
  if (circuitBreaker.state === 'closed') return true;
  if (circuitBreaker.state === 'open') {
    if (Date.now() - circuitBreaker.lastFailure > circuitBreaker.RECOVERY_TIMEOUT) {
      circuitBreaker.state = 'half-open';
      return true;
    }
    return false;
  }
  return true;
}

function recordSuccess() {
  circuitBreaker.failures = 0;
  circuitBreaker.state = 'closed';
}

function recordFailure() {
  circuitBreaker.failures++;
  circuitBreaker.lastFailure = Date.now();
  if (circuitBreaker.failures >= circuitBreaker.FAILURE_THRESHOLD) {
    circuitBreaker.state = 'open';
    console.log('Circuit breaker: OPEN after ' + circuitBreaker.failures + ' failures');
  }
}

// ── Warm Fallback Responses ─────────────────────────────────
const RESTING_MESSAGES = [
  "I'm taking a quick breather to recharge ☁️ I'll be back shortly with fresh insights for your dating journey!",
  "My thinking cap needs a moment to reboot 🌙 In the meantime, trust your instincts — they're better than you think!",
  "I'm resting up so I can give you my best advice 💫 Check back in a few minutes!",
  "Quick power nap in progress 😴 Your dating journey is still going strong — I'll catch up with you soon!",
];

function getRestingMessage(): string {
  return RESTING_MESSAGES[Math.floor(Math.random() * RESTING_MESSAGES.length)];
}

// ── System Prompt Builder ────────────────────────────────────
function buildSystemPrompt(type: string, userContext: any): string {
  const basePersona = `You are MonArk's AI companion — a warm, emotionally intelligent dating coach. You are concise (2-4 sentences max), encouraging, and never preachy. You speak like a trusted friend who wants the user to find a genuine connection.

User context:
- Total dates logged: ${userContext?.totalDates ?? 0}
- Average date rating: ${userContext?.averageRating ? userContext.averageRating.toFixed(1) + '/5' : 'not yet rated'}
- Interests: ${(userContext?.interests || []).join(', ') || 'not specified'}
- RIF profile: ${userContext?.rifProfile ? 'pacing preference ' + (userContext.rifProfile.pacing_preferences ?? '?') + '/10, emotional readiness ' + (userContext.rifProfile.emotional_readiness ?? '?') + '/10' : 'not set up yet'}`;

  if (type === 'generate_insights') {
    return basePersona + `

Generate ONE personalized insight about this user's dating journey. It should feel specific to their data, not generic. Return only the insight text — no labels, no markdown.`;
  }

  if (type === 'celebration') {
    return basePersona + `

The user has hit a milestone: ${userContext?.milestone ?? 'a new achievement'}. Write a warm 1-2 sentence celebration message. Be genuine and specific, not generic hype. Return only the message text.`;
  }

  // chat_response
  return basePersona + `

Respond to the user's message in a supportive, conversational way. Stay in the role of a dating coach. 2-3 sentences max. Return only the response text.`;
}

interface CompanionRequest {
  type: 'generate_insights' | 'chat_response' | 'celebration';
  userContext: {
    recentDates?: any[];
    rifProfile?: any;
    interests?: string[];
    averageRating?: number;
    totalDates?: number;
    userMessage?: string;
    milestone?: string;
  };
}

// ── OpenAI Call ──────────────────────────────────────────────
async function callOpenAI(systemPrompt: string, userMessage: string): Promise<string> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + openaiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 150,
      temperature: 0.75,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error('OpenAI API error ' + response.status + ': ' + errText);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Authenticate user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) throw new Error('Unauthorized')

    const requestData = await req.json()
    const { type, userContext: rawContext }: CompanionRequest = requestData

    // ── LLM Firewall: Strip PII before any AI processing ────
    const userContext = sanitizeCompanionContext(rawContext || {}) as CompanionRequest['userContext'];

    // ── Circuit Breaker Check ───────────────────────────────
    if (!checkCircuitBreaker()) {
      return new Response(JSON.stringify({
        message: sanitizeAIOutput(getRestingMessage()),
        circuit_breaker: 'open',
        retry_after: Math.ceil((circuitBreaker.RECOVERY_TIMEOUT - (Date.now() - circuitBreaker.lastFailure)) / 1000)
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    let message: string

    try {
      const systemPrompt = buildSystemPrompt(type, userContext);

      // Determine the user-facing message to pass as the "user" turn
      let userTurn: string;
      if (type === 'generate_insights') {
        userTurn = 'Generate a personalized insight for me based on my dating activity.';
      } else if (type === 'celebration') {
        userTurn = 'I just hit a milestone: ' + (userContext?.milestone ?? 'a new achievement') + '. Celebrate with me!';
      } else {
        userTurn = userContext?.userMessage || 'How can I improve my dating journey?';
      }

      message = await callOpenAI(systemPrompt, userTurn);

      if (!message) throw new Error('Empty response from OpenAI');

      recordSuccess();

    } catch (processingError) {
      recordFailure();
      console.error('OpenAI call failed (circuit breaker tracking):', processingError);

      return new Response(JSON.stringify({
        message: sanitizeAIOutput(getRestingMessage()),
        circuit_breaker: circuitBreaker.state,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ message: sanitizeAIOutput(message) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to generate response',
        message: "I'm here to support you on your dating journey!"
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
