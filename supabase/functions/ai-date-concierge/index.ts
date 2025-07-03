import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

import { 
  extractMessageContext, 
  analyzeRelationshipProgression, 
  analyzeCommunicationCompatibility 
} from './messageAnalysis.ts';
import { 
  analyzeJournalPreferences, 
  calculateRIFCompatibility, 
  getCurrentSeasonalContext 
} from './dataAnalysis.ts';
import type { 
  DateProposalRequest, 
  ProposalData, 
  EnrichedProposalData, 
  AIAnalysisContext 
} from './types.ts';

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
    const requestData: DateProposalRequest = await req.json();

    console.log('Generating date proposal for conversation:', requestData.conversationId);

    // Multi-factor data collection with error handling
    const analysisContext = await gatherAnalysisData(supabase, requestData);
    
    // Generate comprehensive AI prompt
    const prompt = buildAIPrompt(requestData, analysisContext);

    // Call OpenAI API with retry logic
    const proposalData = await generateProposalWithAI(prompt, OPENAI_API_KEY);

    // Create enriched proposal data for storage
    const enrichedProposalData = createEnrichedProposal(proposalData, analysisContext, requestData);

    return new Response(JSON.stringify(enrichedProposalData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-date-concierge function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: getFallbackProposal()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function gatherAnalysisData(supabase: any, requestData: DateProposalRequest): Promise<AIAnalysisContext> {
  try {
    // Parallel data collection for better performance
    const [
      { data: userJournalEntries },
      { data: currentUserJournal },
      { data: allRifProfiles }
    ] = await Promise.all([
      // Get user's past date journal entries
      supabase
        .from('date_journal')
        .select('date_activity, rating, tags, learned_insights, would_repeat')
        .eq('user_id', requestData.matchUserId)
        .order('created_at', { ascending: false })
        .limit(10),
      
      // Get current user's journal entries
      requestData.currentUserId ? supabase
        .from('date_journal')
        .select('date_activity, rating, tags, learned_insights, would_repeat')
        .eq('user_id', requestData.currentUserId)
        .order('created_at', { ascending: false })
        .limit(10) : Promise.resolve({ data: [] }),
      
      // Get both users' RIF profiles for compatibility
      supabase
        .from('rif_profiles')
        .select('*')
        .eq('is_active', true)
    ]);

    // Calculate RIF compatibility if both profiles exist
    let rifCompatibility = null;
    if (allRifProfiles && allRifProfiles.length >= 2) {
      const userProfile = allRifProfiles.find(p => p.user_id === requestData.matchUserId);
      const currentProfile = allRifProfiles.find(p => p.user_id === requestData.currentUserId);
      
      if (userProfile && currentProfile) {
        rifCompatibility = calculateRIFCompatibility(userProfile, currentProfile);
      }
    }

    // Analyze data components
    const journalAnalysis = analyzeJournalPreferences(userJournalEntries, currentUserJournal);
    const messageAnalysis = extractMessageContext(requestData.recentMessages || []);
    const conversationProgression = analyzeRelationshipProgression(requestData.recentMessages || []);
    const communicationStyles = analyzeCommunicationCompatibility(
      requestData.recentMessages || [], 
      requestData.matchUserId, 
      requestData.currentUserId || ''
    );
    const seasonalContext = getCurrentSeasonalContext();
    const commonInterests = requestData.userInterests.filter(interest => 
      requestData.matchInterests.includes(interest)
    );

    return {
      rifCompatibility,
      journalAnalysis,
      messageAnalysis,
      conversationProgression,
      communicationStyles,
      seasonalContext,
      commonInterests
    };
  } catch (error) {
    console.error('Error gathering analysis data:', error);
    // Return minimal context on error
    return {
      rifCompatibility: null,
      journalAnalysis: { insights: 'Data unavailable' },
      messageAnalysis: { themes: [], sharedInterests: [], categories: [] },
      conversationProgression: { stage: 'Unknown', indicators: [], intimacyLevel: 'Unknown' },
      communicationStyles: { compatibility: 'Unknown', patterns: 'Unknown', engagement: 'Unknown' },
      seasonalContext: getCurrentSeasonalContext(),
      commonInterests: requestData.userInterests.filter(interest => 
        requestData.matchInterests.includes(interest)
      )
    };
  }
}

function buildAIPrompt(requestData: DateProposalRequest, context: AIAnalysisContext): string {
  return `You are an expert dating concierge AI with access to comprehensive relationship intelligence. Generate a highly personalized date proposal using multi-factor analysis:

USER PROFILE:
- Interests: ${requestData.userInterests.join(', ')}
- Location: ${requestData.userLocation || 'Not specified'}
- Bio context: ${requestData.userProfile?.bio || 'Not available'}

MATCH PROFILE:
- Interests: ${requestData.matchInterests.join(', ')}
- Bio context: ${requestData.matchProfile?.bio || 'Not available'}

SHARED INTERESTS: ${context.commonInterests.join(', ')}

RIF COMPATIBILITY ANALYSIS:
${context.rifCompatibility ? `
- Overall Compatibility: ${(context.rifCompatibility.overall * 100).toFixed(1)}%
- Pacing Alignment: ${(context.rifCompatibility.pacing_alignment * 100).toFixed(1)}%
- Emotional Alignment: ${(context.rifCompatibility.emotional_alignment * 100).toFixed(1)}%
- Boundary Alignment: ${(context.rifCompatibility.boundary_alignment * 100).toFixed(1)}%
- Intent Alignment: ${(context.rifCompatibility.intent_alignment * 100).toFixed(1)}%
` : 'RIF profiles not available - use general compatibility approach'}

JOURNAL-BASED PREFERENCES:
${context.journalAnalysis.insights}

MESSAGE CONTEXT ANALYSIS:
- Conversation Themes: ${context.messageAnalysis.themes.join(', ') || 'General conversation'}
- Interests Mentioned: ${context.messageAnalysis.sharedInterests.join(', ') || 'None specifically identified'}
- Topic Categories: ${context.messageAnalysis.categories.join(', ') || 'Mixed topics'}

RELATIONSHIP PROGRESSION:
- Stage: ${context.conversationProgression.stage}
- Progression Indicators: ${context.conversationProgression.indicators.join(', ')}
- Intimacy Level: ${context.conversationProgression.intimacyLevel}

COMMUNICATION COMPATIBILITY:
- Style Match: ${context.communicationStyles.compatibility}
- Response Patterns: ${context.communicationStyles.patterns}
- Engagement Level: ${context.communicationStyles.engagement}

SEASONAL/ENVIRONMENTAL CONTEXT:
${context.seasonalContext}

LOCATION-SPECIFIC CONSIDERATIONS:
${requestData.userLocation ? `Consider ${requestData.userLocation}-specific venues, local culture, and accessibility` : 'Location not specified - suggest adaptable activities'}

Generate a date proposal that:
1. Leverages RIF compatibility scores for optimal pacing and emotional alignment
2. Incorporates proven preferences from journal history
3. Considers current seasonal opportunities and weather
4. Matches conversation tone and depth level
5. Suggests specific, location-appropriate venues when possible

Respond ONLY with a valid JSON object:
{
  "title": "Creative Date Title",
  "activity": "Detailed activity description incorporating multi-factor analysis",
  "location_type": "Indoor/Outdoor/Mixed",
  "vibe": "Relaxed/Creative/Adventurous/Intimate/Cultural",
  "time_suggestion": "Specific timing with seasonal considerations",
  "rationale": "Multi-factor explanation of why this date perfectly matches both people",
  "venue_suggestions": ["Specific venue name/type if location known"],
  "compatibility_notes": "How RIF compatibility influenced this choice",
  "seasonal_advantages": "Why this timing/season enhances the experience"
}`;
}

async function generateProposalWithAI(prompt: string, apiKey: string): Promise<ProposalData> {
  const maxRetries = 2;
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
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

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      try {
        return JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response:', aiResponse);
        if (attempt === maxRetries - 1) {
          return getFallbackProposal();
        }
        continue;
      }
    } catch (error) {
      console.error(`AI generation attempt ${attempt + 1} failed:`, error);
      lastError = error;
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }
  }

  console.error('All AI generation attempts failed, using fallback');
  return getFallbackProposal();
}

function createEnrichedProposal(
  proposalData: ProposalData, 
  context: AIAnalysisContext, 
  requestData: DateProposalRequest
): EnrichedProposalData {
  return {
    ...proposalData,
    ai_analysis: {
      common_interests: context.commonInterests,
      conversation_themes: context.messageAnalysis.themes,
      relationship_stage: context.conversationProgression.stage,
      rif_compatibility: context.rifCompatibility ? context.rifCompatibility.overall : null,
      location_considered: !!requestData.userLocation,
      communication_style: context.communicationStyles.compatibility
    },
    generation_metadata: {
      model: 'gpt-4o-mini',
      timestamp: new Date().toISOString(),
      context_quality: requestData.recentMessages && requestData.recentMessages.length > 10 ? 'high' : 'medium'
    }
  };
}

function getFallbackProposal(): ProposalData {
  return {
    title: "Coffee & Conversation",
    activity: "Meet at a cozy local coffee shop for great conversation and getting to know each other better.",
    location_type: "Indoor",
    vibe: "Relaxed",
    time_suggestion: "Weekend afternoon",
    rationale: "A classic first date that provides a comfortable setting for meaningful conversation."
  };
}