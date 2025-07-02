import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { 
      matchUserId, 
      conversationId, 
      userInterests, 
      matchInterests, 
      recentMessages,
      userLocation,
      userProfile,
      matchProfile 
    } = await req.json();

    console.log('Generating date proposal for conversation:', conversationId);

    // Get user's RIF compatibility data if available
    const { data: rifProfile } = await supabase
      .from('rif_profiles')
      .select('*')
      .eq('user_id', matchUserId)
      .eq('is_active', true)
      .single();

    // Analyze recent messages for context
    const messageContext = recentMessages?.slice(-10).join(' ') || '';
    const commonInterests = userInterests.filter(interest => 
      matchInterests.includes(interest)
    );

    // Create comprehensive prompt for OpenAI
    const prompt = `You are an expert dating concierge AI. Generate a thoughtful, personalized date proposal based on the following information:

USER PROFILE:
- Interests: ${userInterests.join(', ')}
- Location: ${userLocation || 'Not specified'}
- Bio context: ${userProfile?.bio || 'Not available'}

MATCH PROFILE:
- Interests: ${matchInterests.join(', ')}
- Bio context: ${matchProfile?.bio || 'Not available'}

SHARED INTERESTS: ${commonInterests.join(', ')}

RECENT CONVERSATION CONTEXT:
${messageContext}

RIF COMPATIBILITY DATA:
${rifProfile ? `Intent Clarity: ${rifProfile.intent_clarity}, Pacing: ${rifProfile.pacing_preferences}, Emotional Readiness: ${rifProfile.emotional_readiness}` : 'Not available'}

Generate a date proposal that includes:
1. A creative, memorable title (4-6 words)
2. A specific activity description (2-3 sentences)
3. Location type preference (Indoor/Outdoor/Mixed)
4. Suggested vibe (Relaxed/Creative/Adventurous/Intimate/Cultural)
5. Time suggestion (be specific about timeframe)
6. A thoughtful rationale explaining why this date idea fits both people (2-3 sentences)

Consider:
- Shared interests and compatibility
- Conversation themes and connection level
- Activity that encourages natural conversation
- Seasonal appropriateness and logistics
- Balance of comfort and excitement

Respond ONLY with a valid JSON object in this exact format:
{
  "title": "Creative Date Title",
  "activity": "Detailed activity description that explains what you'll do together and why it's engaging.",
  "location_type": "Indoor/Outdoor/Mixed",
  "vibe": "Relaxed/Creative/Adventurous/Intimate/Cultural",
  "time_suggestion": "Specific timing recommendation",
  "rationale": "Why this date idea is perfect for both of you based on your shared interests and conversation."
}`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert dating concierge AI that creates thoughtful, personalized date proposals. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    const aiResponse = openAIData.choices[0].message.content;

    console.log('OpenAI response:', aiResponse);

    // Parse the AI response
    let proposalData;
    try {
      proposalData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback to a basic proposal if AI response is invalid
      proposalData = {
        title: "Coffee & Conversation",
        activity: "Meet at a cozy local coffee shop for great conversation and getting to know each other better.",
        location_type: "Indoor",
        vibe: "Relaxed",
        time_suggestion: "Weekend afternoon",
        rationale: "A classic first date that provides a comfortable setting for meaningful conversation."
      };
    }

    // Create enriched proposal data for storage
    const enrichedProposalData = {
      ai_analysis: {
        common_interests: commonInterests,
        conversation_context: messageContext.length > 0,
        rif_compatibility: rifProfile ? true : false,
        location_considered: userLocation ? true : false
      },
      generation_metadata: {
        model: 'gpt-4o-mini',
        timestamp: new Date().toISOString(),
        context_quality: messageContext.length > 100 ? 'high' : 'medium'
      },
      ...proposalData
    };

    return new Response(JSON.stringify(enrichedProposalData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-date-concierge function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      // Fallback proposal in case of complete failure
      fallback: {
        title: "Coffee Date",
        activity: "Meet for coffee and conversation at a comfortable local café.",
        location_type: "Indoor",
        vibe: "Relaxed",
        time_suggestion: "This weekend",
        rationale: "A classic, low-pressure way to get to know each other better."
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});