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
      matchProfile,
      currentUserId
    } = await req.json();

    console.log('Generating date proposal for conversation:', conversationId);

    // Multi-factor data collection
    const analysisPromises = [
      // Get user's RIF compatibility data
      supabase
        .from('rif_profiles')
        .select('*')
        .eq('user_id', matchUserId)
        .eq('is_active', true)
        .single(),
      
      // Get user's past date journal entries for preference analysis
      supabase
        .from('date_journal')
        .select('date_activity, rating, tags, learned_insights, would_repeat')
        .eq('user_id', matchUserId)
        .order('created_at', { ascending: false })
        .limit(10),
      
      // Get current user's journal entries
      currentUserId ? supabase
        .from('date_journal')
        .select('date_activity, rating, tags, learned_insights, would_repeat')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(10) : Promise.resolve({ data: [] }),
      
      // Get both users' RIF profiles for compatibility
      supabase
        .from('rif_profiles')
        .select('*')
        .eq('is_active', true)
    ];

    const [
      { data: rifProfile },
      { data: userJournalEntries },
      { data: currentUserJournal },
      { data: allRifProfiles }
    ] = await Promise.all(analysisPromises);

    // Calculate RIF compatibility if both profiles exist
    let rifCompatibility = null;
    if (allRifProfiles && allRifProfiles.length >= 2) {
      const userProfile = allRifProfiles.find(p => p.user_id === matchUserId);
      const currentProfile = allRifProfiles.find(p => p.user_id !== matchUserId);
      
      if (userProfile && currentProfile) {
        rifCompatibility = {
          pacing_alignment: 1 - Math.abs(userProfile.pacing_preferences - currentProfile.pacing_preferences) / 10,
          emotional_alignment: 1 - Math.abs(userProfile.emotional_readiness - currentProfile.emotional_readiness) / 10,
          boundary_alignment: 1 - Math.abs(userProfile.boundary_respect - currentProfile.boundary_respect) / 10,
          intent_alignment: 1 - Math.abs(userProfile.intent_clarity - currentProfile.intent_clarity) / 10
        };
        rifCompatibility.overall = (
          rifCompatibility.pacing_alignment + 
          rifCompatibility.emotional_alignment + 
          rifCompatibility.boundary_alignment + 
          rifCompatibility.intent_alignment
        ) / 4;
      }
    }

    // Analyze journal entries for preference patterns
    const journalAnalysis = analyzeJournalPreferences(userJournalEntries, currentUserJournal);
    
    // Enhanced message context extraction
    const messageAnalysis = extractMessageContext(recentMessages || []);
    const conversationProgression = analyzeRelationshipProgression(recentMessages || []);
    const communicationStyles = analyzeCommunicationCompatibility(recentMessages || [], matchUserId, currentUserId);
    
    // Get current season and weather considerations
    const seasonalContext = getCurrentSeasonalContext();
    
    const commonInterests = userInterests.filter(interest => 
      matchInterests.includes(interest)
    );

    // Create comprehensive multi-factor prompt for OpenAI
    const prompt = `You are an expert dating concierge AI with access to comprehensive relationship intelligence. Generate a highly personalized date proposal using multi-factor analysis:

USER PROFILE:
- Interests: ${userInterests.join(', ')}
- Location: ${userLocation || 'Not specified'}
- Bio context: ${userProfile?.bio || 'Not available'}

MATCH PROFILE:
- Interests: ${matchInterests.join(', ')}
- Bio context: ${matchProfile?.bio || 'Not available'}

SHARED INTERESTS: ${commonInterests.join(', ')}

RIF COMPATIBILITY ANALYSIS:
${rifCompatibility ? `
- Overall Compatibility: ${(rifCompatibility.overall * 100).toFixed(1)}%
- Pacing Alignment: ${(rifCompatibility.pacing_alignment * 100).toFixed(1)}%
- Emotional Alignment: ${(rifCompatibility.emotional_alignment * 100).toFixed(1)}%
- Boundary Alignment: ${(rifCompatibility.boundary_alignment * 100).toFixed(1)}%
- Intent Alignment: ${(rifCompatibility.intent_alignment * 100).toFixed(1)}%
` : 'RIF profiles not available - use general compatibility approach'}

JOURNAL-BASED PREFERENCES:
${journalAnalysis.insights}

MESSAGE CONTEXT ANALYSIS:
- Conversation Themes: ${messageAnalysis.themes.join(', ') || 'General conversation'}
- Interests Mentioned: ${messageAnalysis.sharedInterests.join(', ') || 'None specifically identified'}
- Topic Categories: ${messageAnalysis.categories.join(', ') || 'Mixed topics'}

RELATIONSHIP PROGRESSION:
- Stage: ${conversationProgression.stage}
- Progression Indicators: ${conversationProgression.indicators.join(', ')}
- Intimacy Level: ${conversationProgression.intimacyLevel}

COMMUNICATION COMPATIBILITY:
- Style Match: ${communicationStyles.compatibility}
- Response Patterns: ${communicationStyles.patterns}
- Engagement Level: ${communicationStyles.engagement}

SEASONAL/ENVIRONMENTAL CONTEXT:
${seasonalContext}

LOCATION-SPECIFIC CONSIDERATIONS:
${userLocation ? `Consider ${userLocation}-specific venues, local culture, and accessibility` : 'Location not specified - suggest adaptable activities'}

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
        conversation_themes: messageAnalysis.themes,
        relationship_stage: conversationProgression.stage,
        rif_compatibility: rifCompatibility ? rifCompatibility.overall : null,
        location_considered: userLocation ? true : false,
        communication_style: communicationStyles.compatibility
      },
      generation_metadata: {
        model: 'gpt-4o-mini',
        timestamp: new Date().toISOString(),
        context_quality: recentMessages?.length > 10 ? 'high' : 'medium'
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

// Helper function to analyze journal preferences
function analyzeJournalPreferences(userEntries: any[], currentUserEntries: any[]) {
  const allEntries = [...(userEntries || []), ...(currentUserEntries || [])];
  
  if (allEntries.length === 0) {
    return { insights: 'No previous date history available - will suggest popular, well-rounded activities' };
  }

  const highRatedActivities = allEntries.filter(entry => entry.rating >= 4);
  const wouldRepeatActivities = allEntries.filter(entry => entry.would_repeat === true);
  const commonTags = allEntries.flatMap(entry => entry.tags || []);
  const tagCounts = commonTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});

  const topTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);

  const insights = [
    highRatedActivities.length > 0 ? `Highly rated activities: ${highRatedActivities.map(a => a.date_activity).join(', ')}` : '',
    wouldRepeatActivities.length > 0 ? `Activities they'd repeat: ${wouldRepeatActivities.map(a => a.date_activity).join(', ')}` : '',
    topTags.length > 0 ? `Preferred themes: ${topTags.join(', ')}` : '',
    allEntries.some(e => e.learned_insights) ? 'User values learning and growth from date experiences' : ''
  ].filter(Boolean).join('. ');

  return {
    insights: insights || 'User has date experience but no clear patterns - suggest variety',
    highRatedActivities,
    topTags,
    avgRating: allEntries.filter(e => e.rating).reduce((sum, e) => sum + e.rating, 0) / allEntries.filter(e => e.rating).length || 0
  };
}

// Helper function to get current seasonal context
function getCurrentSeasonalContext() {
  const now = new Date();
  const month = now.getMonth();
  const hour = now.getHours();
  
  let season = '';
  if (month >= 2 && month <= 4) season = 'Spring';
  else if (month >= 5 && month <= 7) season = 'Summer';
  else if (month >= 8 && month <= 10) season = 'Fall';
  else season = 'Winter';

  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  
  const seasonalSuggestions = {
    Spring: 'Perfect for outdoor activities, blooming gardens, farmers markets, and fresh air dates',
    Summer: 'Great for beach activities, outdoor concerts, picnics, hiking, and longer daylight hours',
    Fall: 'Ideal for cozy indoor activities, apple picking, fall foliage walks, and warm beverages',
    Winter: 'Perfect for indoor cultural activities, ice skating, holiday markets, and cozy fireside chats'
  };

  return `Current season: ${season} (${timeOfDay}). ${seasonalSuggestions[season]}. Consider current weather patterns and daylight hours.`;
}

// Helper function to analyze conversation sentiment and tone
function analyzeConversationSentiment(messages: string[] = []) {
  if (!messages || messages.length === 0) {
    return 'Limited conversation history - suggest engaging but low-pressure activities';
  }

  const recentMessages = messages.slice(-10);
  const messageText = recentMessages.join(' ').toLowerCase();
  
  // Simple sentiment analysis based on keywords
  const positiveWords = ['excited', 'amazing', 'love', 'awesome', 'great', 'wonderful', 'fun', 'happy', 'enjoy', 'fantastic'];
  const questionWords = ['what', 'how', 'when', 'where', 'why', 'do you', 'have you', 'would you'];
  const deepWords = ['feel', 'think', 'believe', 'dream', 'passion', 'value', 'important', 'meaningful'];
  
  const positiveCount = positiveWords.filter(word => messageText.includes(word)).length;
  const questionCount = questionWords.filter(word => messageText.includes(word)).length;
  const deepCount = deepWords.filter(word => messageText.includes(word)).length;

  let sentiment = 'neutral';
  if (positiveCount >= 2) sentiment = 'positive';
  if (questionCount >= 3) sentiment += ', curious';
  if (deepCount >= 2) sentiment += ', deep';

  const avgMessageLength = recentMessages.reduce((sum, msg) => sum + msg.length, 0) / recentMessages.length;
  const conversationDepth = avgMessageLength > 50 ? 'detailed' : avgMessageLength > 20 ? 'moderate' : 'brief';

  return `${sentiment} tone with ${conversationDepth} exchanges (${recentMessages.length} recent messages)`;
}

// Helper function to extract conversation themes and topics
function extractMessageContext(messages: string[] = []) {
  if (!messages || messages.length === 0) {
    return { themes: [], sharedInterests: [], categories: [] };
  }

  const messageText = messages.join(' ').toLowerCase();
  
  // Define topic categories and keywords
  const topicKeywords = {
    hobbies: ['hobby', 'hobbies', 'passion', 'enjoy', 'love doing', 'favorite', 'into', 'really like'],
    travel: ['travel', 'trip', 'vacation', 'visit', 'explore', 'adventure', 'journey', 'abroad', 'country', 'city'],
    food: ['food', 'restaurant', 'cook', 'cooking', 'eat', 'favorite food', 'cuisine', 'dinner', 'lunch', 'coffee'],
    entertainment: ['movie', 'music', 'concert', 'show', 'netflix', 'streaming', 'book', 'reading', 'game', 'gaming'],
    sports: ['sport', 'sports', 'gym', 'workout', 'exercise', 'fitness', 'running', 'swimming', 'hiking', 'yoga'],
    career: ['work', 'job', 'career', 'business', 'project', 'professional', 'company', 'colleague'],
    lifestyle: ['weekend', 'free time', 'relax', 'chill', 'hang out', 'spend time', 'daily', 'routine'],
    values: ['important', 'believe', 'value', 'meaningful', 'care about', 'matter', 'principle']
  };

  // Extract themes and categories
  const detectedCategories = [];
  const themes = [];
  
  for (const [category, keywords] of Object.entries(topicKeywords)) {
    const matchedKeywords = keywords.filter(keyword => messageText.includes(keyword));
    if (matchedKeywords.length > 0) {
      detectedCategories.push(category);
      themes.push(...matchedKeywords.slice(0, 2)); // Limit to top 2 per category
    }
  }

  // Extract potential shared interests mentioned in conversation
  const interestKeywords = [
    'both', 'we both', 'same', 'similar', 'also', 'too', 'as well',
    'agree', 'exactly', 'totally', 'definitely', 'absolutely'
  ];
  
  const sharedInterests = [];
  messages.forEach(message => {
    const lowerMessage = message.toLowerCase();
    if (interestKeywords.some(keyword => lowerMessage.includes(keyword))) {
      // Extract the context around agreement words
      const words = lowerMessage.split(' ');
      for (let i = 0; i < words.length; i++) {
        if (interestKeywords.includes(words[i])) {
          const context = words.slice(Math.max(0, i-3), i+4).join(' ');
          if (context.length > 10) {
            sharedInterests.push(context);
          }
        }
      }
    }
  });

  return {
    themes: [...new Set(themes)],
    sharedInterests: [...new Set(sharedInterests)].slice(0, 5),
    categories: detectedCategories
  };
}

// Helper function to analyze relationship progression cues
function analyzeRelationshipProgression(messages: string[] = []) {
  if (!messages || messages.length === 0) {
    return { stage: 'Initial', indicators: [], intimacyLevel: 'Surface' };
  }

  const messageText = messages.join(' ').toLowerCase();
  
  // Progression indicators
  const progressionCues = {
    getting_to_know: ['tell me about', 'what do you', 'how do you', 'where did you', 'when did you', 'getting to know'],
    sharing_personal: ['my family', 'my friends', 'my childhood', 'growing up', 'personal', 'private', 'share'],
    future_oriented: ['someday', 'future', 'plan', 'dream', 'hope', 'want to', 'would love to', 'imagine'],
    emotional_connection: ['feel', 'emotion', 'heart', 'soul', 'deep', 'meaningful', 'connection', 'chemistry'],
    meeting_intent: ['meet', 'in person', 'hang out', 'get together', 'see you', 'date', 'coffee', 'dinner']
  };

  const intimacyMarkers = {
    surface: ['weather', 'work', 'basic', 'general', 'simple'],
    moderate: ['opinion', 'prefer', 'like', 'dislike', 'experience', 'story'],
    deep: ['vulnerable', 'personal', 'private', 'intimate', 'meaningful', 'important', 'value', 'believe']
  };

  // Analyze progression stage
  let stage = 'Initial Contact';
  const indicators = [];
  
  for (const [stageType, keywords] of Object.entries(progressionCues)) {
    const matches = keywords.filter(keyword => messageText.includes(keyword));
    if (matches.length > 0) {
      indicators.push(stageType.replace('_', ' '));
      
      if (stageType === 'meeting_intent') stage = 'Ready to Meet';
      else if (stageType === 'emotional_connection') stage = 'Building Connection';
      else if (stageType === 'future_oriented') stage = 'Future Planning';
      else if (stageType === 'sharing_personal') stage = 'Personal Sharing';
      else if (stageType === 'getting_to_know') stage = 'Discovery Phase';
    }
  }

  // Determine intimacy level
  let intimacyLevel = 'Surface';
  let deepCount = 0;
  let moderateCount = 0;
  
  for (const [level, keywords] of Object.entries(intimacyMarkers)) {
    const matches = keywords.filter(keyword => messageText.includes(keyword));
    if (level === 'deep' && matches.length > 0) deepCount += matches.length;
    if (level === 'moderate' && matches.length > 0) moderateCount += matches.length;
  }

  if (deepCount > 2) intimacyLevel = 'Deep';
  else if (moderateCount > 3 || deepCount > 0) intimacyLevel = 'Moderate';

  return {
    stage,
    indicators,
    intimacyLevel
  };
}

// Helper function to analyze communication style compatibility
function analyzeCommunicationCompatibility(messages: string[] = [], userId1: string, userId2: string) {
  if (!messages || messages.length < 4) {
    return { 
      compatibility: 'Insufficient data', 
      patterns: 'Limited conversation history',
      engagement: 'Unknown'
    };
  }

  // Analyze message patterns (simplified - in real implementation would track by user)
  const messageAnalysis = {
    avgLength: messages.reduce((sum, msg) => sum + msg.length, 0) / messages.length,
    questionCount: messages.filter(msg => msg.includes('?')).length,
    exclamationCount: messages.filter(msg => msg.includes('!')).length,
    emojiCount: messages.filter(msg => /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(msg)).length,
  };

  // Determine communication styles
  let compatibility = 'Good match';
  let patterns = 'Balanced exchange';
  let engagement = 'Active';

  if (messageAnalysis.avgLength > 100) {
    patterns = 'Detailed, thoughtful communicators';
  } else if (messageAnalysis.avgLength < 30) {
    patterns = 'Concise, quick exchanges';
  }

  if (messageAnalysis.questionCount > messages.length * 0.3) {
    engagement = 'Highly curious and engaged';
  } else if (messageAnalysis.questionCount < messages.length * 0.1) {
    engagement = 'Statement-based communication';
  }

  if (messageAnalysis.exclamationCount > messages.length * 0.2) {
    compatibility += ' - Enthusiastic styles';
  }

  if (messageAnalysis.emojiCount > messages.length * 0.3) {
    compatibility += ' - Expressive communication';
  }

  return {
    compatibility,
    patterns,
    engagement
  };
}