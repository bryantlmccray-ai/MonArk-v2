import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    const authClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    
    const { data: { user }, error: authError } = await authClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const requestData: DateProposalRequest = await req.json();

    // Ensure user can only create proposals for themselves
    if (requestData.currentUserId && requestData.currentUserId !== user.id) {
      throw new Error('Cannot create proposals for other users');
    }

    console.log('Generating date proposal for conversation:', requestData.conversationId);

    // Find common interests
    const commonInterests = requestData.userInterests.filter(interest => 
      requestData.matchInterests.includes(interest)
    );

    // Select suggestion based on common interests or randomly
    let selectedSuggestion = DATE_SUGGESTIONS[Math.floor(Math.random() * DATE_SUGGESTIONS.length)];
    
    // Try to match vibe to interests
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

    const proposal = {
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

    console.log('Returning proposal:', proposal.title);

    return new Response(JSON.stringify(proposal), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-date-concierge function:', error);
    
    // Return fallback
    const fallback = {
      title: "Coffee & Conversation",
      activity: "Meet at a cozy local coffee shop for great conversation and getting to know each other better.",
      location_type: "Indoor",
      vibe: "Relaxed",
      time_suggestion: "Weekend afternoon",
      rationale: "A classic first date that provides a comfortable setting for meaningful conversation."
    };
    
    return new Response(JSON.stringify({ 
      ...fallback,
      error: error.message
    }), {
      status: 200, // Return 200 with fallback
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
