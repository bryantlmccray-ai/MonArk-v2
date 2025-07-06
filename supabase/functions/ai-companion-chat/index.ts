import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type, userContext }: CompanionRequest = await req.json()
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    let systemPrompt = `You are MonArk's AI Dating Companion - a warm, insightful, and exceptionally knowledgeable guide who helps users grow in their dating journey. You have deep expertise in relationships, psychology, and dating dynamics.

CORE PERSONALITY:
- Conversational and empathetic, like talking to a wise friend who's also a relationship expert
- Encouraging but honest, providing genuine insights
- Focused on personal growth, emotional intelligence, and authentic connections
- Uses gentle insights rather than prescriptive advice
- Celebrates progress and milestones meaningfully
- Speaks naturally and engagingly, avoiding AI-like responses

EXPERTISE AREAS:
1. **Dating Experiences & Feelings**: Help users process their dating experiences, validate emotions, identify patterns, and find meaning in both positive and challenging dates
2. **Compatibility Analysis**: Explain compatibility scores, factors that influence matching, and how different personality traits complement each other
3. **Match & Date Suggestions**: Provide clear rationale for why certain people or activities were suggested based on user data and preferences
4. **RIF-Based Advice**: Give personalized guidance using their Relational Intelligence Framework scores for emotional readiness, pacing, boundaries, etc.

AVAILABLE USER DATA:
- Recent dates and detailed journal entries with ratings and reflections
- RIF profile scores (emotional_readiness, pacing_preferences, boundary_respect, post_date_alignment, intent_clarity)
- Dating patterns, preferences, and behavior history
- Interests, relationship goals, and lifestyle preferences
- Compatibility insights and matching data

KEY CONVERSATION TOPICS YOU EXCEL AT:
- Processing difficult dates or rejections with empathy and growth mindset
- Celebrating dating wins and helping recognize progress
- Explaining "why" behind compatibility scores and match suggestions
- Providing RIF-informed advice on pacing, boundaries, and emotional readiness
- Helping identify personal dating patterns and blind spots
- Offering specific, actionable dating strategies
- Discussing feelings of dating fatigue, anxiety, or excitement
- Guiding reflection on what they're learning about themselves

RESPONSE STYLE:
- Always reference specific user data when relevant (their RIF scores, recent dates, patterns)
- Provide concrete explanations, not vague platitudes
- Ask thoughtful follow-up questions to deepen the conversation
- Balance validation with gentle challenges for growth
- Use their name and personal details naturally in conversation
- Keep responses conversational (2-4 sentences typically)
- When explaining compatibility or suggestions, be specific about the "why"`

    let userPrompt = ''

    switch (type) {
      case 'generate_insights':
        userPrompt = generateInsightsPrompt(userContext)
        break
      case 'chat_response':
        userPrompt = `User message: "${userContext.userMessage}"
        
        USER DATING CONTEXT:
        - Total dates logged: ${userContext.totalDates || 0}
        - Average date rating: ${userContext.averageRating?.toFixed(1) || 'N/A'}/5
        - Recent date activities: ${userContext.recentDates?.map((d: any) => d.date_activity).join(', ') || 'None yet'}
        - Interests: ${userContext.interests?.join(', ') || 'None specified'}
        
        RIF PROFILE SCORES (Relational Intelligence Framework):
        - Emotional Readiness: ${userContext.rifProfile?.emotional_readiness || 'N/A'}/10
        - Pacing Preferences: ${userContext.rifProfile?.pacing_preferences || 'N/A'}/10  
        - Boundary Respect: ${userContext.rifProfile?.boundary_respect || 'N/A'}/10
        - Post-Date Alignment: ${userContext.rifProfile?.post_date_alignment || 'N/A'}/10
        - Intent Clarity: ${userContext.rifProfile?.intent_clarity || 'N/A'}/10
        
        RECENT DATE DETAILS:
        ${userContext.recentDates?.map((date: any, i: number) => 
          `Date ${i+1}: ${date.date_activity} with ${date.partner_name} - Rated ${date.rating}/5
          ${date.reflection_notes ? `Reflection: ${date.reflection_notes}` : ''}
          ${date.learned_insights ? `Insights: ${date.learned_insights}` : ''}`
        ).join('\n') || 'No recent dates logged'}
        
        SPECIALIZED RESPONSE TYPES:
        
        1. **Dating Experiences & Feelings**: If they're sharing about a date, rejection, or emotional experience:
           - Validate their feelings specifically
           - Help them find meaning and growth opportunities
           - Reference their RIF scores for personalized advice
           - Ask thoughtful follow-up questions about their experience
        
        2. **Compatibility Questions**: If asking about matches or compatibility:
           - Explain how compatibility scoring works using their interests and RIF profile
           - Give specific examples of why certain traits complement each other
           - Reference their pacing preferences and emotional readiness scores
           - Explain the "science" behind good matches
        
        3. **Match/Date Suggestion Explanations**: If asking why something was suggested:
           - Reference their specific interests and past date ratings
           - Explain how their RIF profile influenced the suggestion
           - Connect suggestions to their dating patterns and preferences
           - Be specific about the reasoning, not generic
        
        4. **RIF-Based Dating Advice**: For advice requests:
           - Use their specific RIF scores to give tailored guidance
           - Address their emotional readiness level appropriately
           - Give pacing advice based on their pacing_preferences score
           - Offer boundary-setting tips based on their boundary_respect score
           - Make advice actionable and specific to their situation
        
        Provide a thoughtful, personalized response (2-4 sentences) that demonstrates deep understanding of their situation and data. Reference specific details when relevant.`
        break
      case 'celebration':
        userPrompt = generateCelebrationPrompt(userContext)
        break
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 300
      }),
    })

    const data = await response.json()
    const aiMessage = data.choices[0].message.content

    // Parse response into structured insights if generating insights
    if (type === 'generate_insights') {
      const insights = parseInsightsResponse(aiMessage, userContext)
      return new Response(JSON.stringify({ insights }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in AI companion chat:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate AI response' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function generateInsightsPrompt(context: any): string {
  return `Generate 2-3 personalized, conversational insights for this user's dating journey:

User Context:
- Total dates: ${context.totalDates || 0}
- Recent dates: ${context.recentDates?.length || 0}
- Average rating: ${context.averageRating || 'N/A'}
- Interests: ${context.interests?.join(', ') || 'None specified'}
- RIF Emotional Readiness: ${context.rifProfile?.emotional_readiness || 'N/A'}/10
- RIF Pacing Preferences: ${context.rifProfile?.pacing_preferences || 'N/A'}/10
- RIF Boundary Respect: ${context.rifProfile?.boundary_respect || 'N/A'}/10

Recent date activities: ${context.recentDates?.map((d: any) => d.date_activity).join(', ') || 'None'}

Generate insights that:
1. Notice specific patterns in their dating behavior
2. Celebrate their growth and positive trends
3. Offer gentle suggestions for variety or improvement
4. Reference their RIF profile for personalized timing/approach advice
5. Use conversational language like "Hey! I noticed..." or "I love that you..."

Format each insight as a separate paragraph starting with an engaging opener.
Include emojis naturally but don't overuse them.
Keep tone warm, encouraging, and like talking to a good friend.`
}

function generateCelebrationPrompt(context: any): string {
  return `Create an encouraging celebration message for this dating milestone:

User achieved: ${context.totalDates} total dates logged
Recent performance: ${context.averageRating}/5 average rating
Growth area: ${context.rifProfile ? 'Strong emotional intelligence scores' : 'Building self-awareness'}

Make it:
- Genuinely celebratory and proud
- Specific to their achievement  
- Encouraging for continued growth
- Warm and personal
- 1-2 sentences max

Start with something like "Amazing!" or "Incredible work!" or similar.`
}

function parseInsightsResponse(response: string, context: any) {
  // Split response into individual insights and create structured objects
  const paragraphs = response.split('\n\n').filter(p => p.trim())
  
  return paragraphs.map((content, index) => ({
    id: `ai_insight_${Date.now()}_${index}`,
    type: index === 0 ? 'insight' : (index === 1 ? 'suggestion' : 'celebration'),
    content: content.trim(),
    timestamp: new Date().toISOString(),
    actionable: content.toLowerCase().includes('idea') || content.toLowerCase().includes('suggestion'),
    action: content.toLowerCase().includes('date') ? {
      label: 'Get personalized date idea',
      type: 'generate_date' as const
    } : undefined
  }))
}