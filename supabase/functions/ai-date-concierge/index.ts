import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { sanitizeConciergeContext } from '../_shared/ai-sanitizer.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

function recordSuccess() { circuitBreaker.failures = 0; circuitBreaker.state = 'closed'; }
function recordFailure() {
  circuitBreaker.failures++;
  circuitBreaker.lastFailure = Date.now();
  if (circuitBreaker.failures >= circuitBreaker.FAILURE_THRESHOLD) {
    circuitBreaker.state = 'open';
    console.log(`Circuit breaker OPEN after ${circuitBreaker.failures} failures`);
  }
}

const RESTING_FALLBACK = {
  title: "Your Date Concierge is Recharging ☁️",
  activity: "While I'm resting up, here's a classic: grab coffee at a cozy local spot and let the conversation flow naturally.",
  location_type: "Indoor",
  vibe: "Relaxed",
  time_suggestion: "Whenever feels right",
  rationale: "I'll be back shortly with personalized suggestions! In the meantime, the best dates start with genuine curiosity about each other.",
  circuit_breaker: 'open',
};

interface DateProposalRequest {
  conversationId: string;
  matchUserId: string;
  currentUserId?: string;
  userInterests: string[];
  matchInterests: string[];
  userLocation?: string;
  userProfile?: { bio?: string };
  matchProfile?: { bio?: string };
  recentMessages?: any[];
  async?: boolean;
  autoGenerate?: boolean;
}

// Pre-built date suggestions for MVP - no external AI required
const DATE_SUGGESTIONS = [
  {
    title: "Coffee & Art Walk",
    activity: "Start with specialty coffee at a local roaster, then explore nearby street art or visit a gallery together. Perfect for sparking natural conversation while staying active.",
    location_type: "Mixed",
    vibe: "Creative",
    time_suggestion: "Weekend afternoon, 2-3 hours",
    rationale: "Low pressure setting that naturally sparks conversation through shared discoveries."
  },
  {
    title: "Sunset Picnic",
    activity: "Pack some simple snacks and find a scenic spot to watch the sunset together. Bring a blanket, maybe some music, and enjoy the moment.",
    location_type: "Outdoor",
    vibe: "Romantic",
    time_suggestion: "Early evening, around golden hour, 2 hours",
    rationale: "Beautiful, memorable setting without the formality of a restaurant. Nature does the work."
  },
  {
    title: "Farmers Market Adventure",
    activity: "Browse local vendors together, sample interesting foods, maybe pick up ingredients to cook a meal together later.",
    location_type: "Outdoor",
    vibe: "Adventurous",
    time_suggestion: "Weekend morning, 2-3 hours",
    rationale: "Lots of built-in conversation starters and shared mini-experiences."
  },
  {
    title: "Live Music Night",
    activity: "Check out a local band or open mic at a cozy venue. Great energy for a date with natural conversation breaks between sets.",
    location_type: "Indoor",
    vibe: "Cultural",
    time_suggestion: "Evening, 2-3 hours",
    rationale: "Shared experience that creates connection without pressure for constant conversation."
  },
  {
    title: "Bookstore & Café Date",
    activity: "Explore a bookstore together, share your favorite sections and picks, then discuss over coffee or tea nearby.",
    location_type: "Indoor",
    vibe: "Relaxed",
    time_suggestion: "Afternoon, 2 hours",
    rationale: "Learn about each other's interests and worldview through book choices. Very revealing!"
  },
  {
    title: "Morning Hike & Brunch",
    activity: "Start with an easy, scenic trail with a nice viewpoint, then reward yourselves with brunch at a local spot.",
    location_type: "Outdoor",
    vibe: "Adventurous",
    time_suggestion: "Morning, 3-4 hours",
    rationale: "Endorphins and fresh air create positive vibes. Active dates build stronger connections."
  },
  {
    title: "Cooking Class Together",
    activity: "Take a beginner cooking class - pasta making, sushi rolling, or whatever sounds fun. Work together and enjoy what you create.",
    location_type: "Indoor",
    vibe: "Creative",
    time_suggestion: "Evening, 2-3 hours",
    rationale: "Collaborative activity that naturally reveals communication and teamwork styles."
  },
  {
    title: "Board Game Café",
    activity: "Visit a board game café and pick games neither of you have played. Light competition, lots of laughs, good snacks.",
    location_type: "Indoor",
    vibe: "Relaxed",
    time_suggestion: "Evening or weekend afternoon, 2-3 hours",
    rationale: "Playful atmosphere that brings out personalities. Easy to extend if going well!"
  }
];

function generateProposal(requestData: DateProposalRequest) {
  const commonInterests = requestData.userInterests.filter(interest => 
    requestData.matchInterests.includes(interest)
  );

  let selectedSuggestion = DATE_SUGGESTIONS[Math.floor(Math.random() * DATE_SUGGESTIONS.length)];
  
  const interestString = commonInterests.join(' ').toLowerCase();
  if (interestString.includes('art') || interestString.includes('creative') || interestString.includes('music')) {
    const creative = DATE_SUGGESTIONS.filter(s => s.vibe === 'Creative' || s.vibe === 'Cultural');
    if (creative.length) selectedSuggestion = creative[Math.floor(Math.random() * creative.length)];
  } else if (interestString.includes('outdoor') || interestString.includes('hiking') || interestString.includes('nature')) {
    const outdoor = DATE_SUGGESTIONS.filter(s => s.location_type === 'Outdoor');
    if (outdoor.length) selectedSuggestion = outdoor[Math.floor(Math.random() * outdoor.length)];
  } else if (interestString.includes('food') || interestString.includes('cooking') || interestString.includes('cuisine')) {
    const food = DATE_SUGGESTIONS.filter(s => s.activity.toLowerCase().includes('cook') || s.activity.toLowerCase().includes('food'));
    if (food.length) selectedSuggestion = food[Math.floor(Math.random() * food.length)];
  }

  return {
    ...selectedSuggestion,
    ai_analysis: {
      common_interests: commonInterests,
      conversation_themes: [],
      relationship_stage: 'early',
      rif_compatibility: null,
      location_considered: !!requestData.userLocation,
      communication_style: 'friendly'
    },
    generation_metadata: {
      model: 'rule-based-mvp',
      timestamp: new Date().toISOString(),
      context_quality: 'medium'
    }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const rawRequest = await req.json();

    // ── LLM Firewall: Strip PII before any AI processing ────
    const requestData = sanitizeConciergeContext(rawRequest) as DateProposalRequest;

    if (requestData.currentUserId && requestData.currentUserId !== user.id) {
      throw new Error('Cannot create proposals for other users');
    }

    console.log('Date proposal request for conversation:', requestData.conversationId);

    // ── Circuit Breaker Check ───────────────────────────────
    if (!checkCircuitBreaker()) {
      console.log('Circuit breaker OPEN: returning resting fallback');
      return new Response(JSON.stringify(RESTING_FALLBACK), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── ASYNC PATH ──────────────────────────────────────────────
    if (requestData.async) {
      const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      const { data: job, error: jobError } = await serviceClient
        .from('async_jobs')
        .insert({
          user_id: user.id,
          job_type: 'date_proposal',
          status: 'processing',
          started_at: new Date().toISOString(),
          input_data: {
            conversationId: requestData.conversationId,
            matchUserId: requestData.matchUserId,
          },
        })
        .select('id')
        .single();

      if (jobError) throw jobError;

      try {
        const proposal = generateProposal(requestData);
        recordSuccess();
        
        await serviceClient
          .from('async_jobs')
          .update({
            status: 'completed',
            result_data: proposal,
            completed_at: new Date().toISOString(),
          })
          .eq('id', job.id);
      } catch (processError) {
        recordFailure();
        await serviceClient
          .from('async_jobs')
          .update({
            status: 'failed',
            error_message: processError instanceof Error ? processError.message : 'Unknown error',
            completed_at: new Date().toISOString(),
          })
          .eq('id', job.id);
      }

      return new Response(JSON.stringify({ job_id: job.id, status: 'processing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── AUTO-GENERATE PATH (on mutual match) ─────────────────
    if (requestData.autoGenerate) {
      try {
        const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // Fetch both profiles for better matching
        const { data: userProfile } = await serviceClient
          .from('user_profiles')
          .select('interests, location, bio')
          .eq('user_id', user.id)
          .single();

        const { data: matchProfile } = await serviceClient
          .from('user_profiles')
          .select('interests, bio')
          .eq('user_id', requestData.matchUserId)
          .single();

        // Enrich request with real profile data
        const enrichedRequest = {
          ...requestData,
          userInterests: userProfile?.interests || [],
          matchInterests: matchProfile?.interests || [],
          userLocation: userProfile?.location || undefined,
        };

        const proposal = generateProposal(enrichedRequest);
        recordSuccess();

        // Auto-save the proposal to the database
        const { error: insertError } = await serviceClient
          .from('date_proposals')
          .insert({
            creator_user_id: user.id,
            recipient_user_id: requestData.matchUserId,
            conversation_id: requestData.conversationId,
            title: proposal.title,
            activity: proposal.activity,
            location_type: proposal.location_type,
            vibe: proposal.vibe,
            time_suggestion: proposal.time_suggestion,
            rationale: proposal.rationale,
            ai_generated: true,
            proposal_data: proposal,
          });

        if (insertError) {
          console.error('Error auto-saving date proposal:', insertError);
        } else {
          console.log('Auto-generated date proposal saved:', proposal.title);
        }

        return new Response(JSON.stringify({ success: true, proposal }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (autoErr) {
        recordFailure();
        console.error('Auto-generate error:', autoErr);
        return new Response(JSON.stringify({ success: false, error: 'Auto-generation failed' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── SYNC PATH (default, fast rule-based) ────────────────────
    try {
      const proposal = generateProposal(requestData);
      recordSuccess();
      console.log('Returning proposal:', proposal.title);

      return new Response(JSON.stringify(proposal), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (genError) {
      recordFailure();
      throw genError;
    }

  } catch (error) {
    console.error('Error in ai-date-concierge function:', error);
    recordFailure();
    
    return new Response(JSON.stringify({ 
      ...RESTING_FALLBACK,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});