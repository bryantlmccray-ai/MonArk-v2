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

    let systemPrompt = `You are MonArk's AI Dating Companion - a warm, insightful, and encouraging guide who helps users grow in their dating journey. You have access to their dating patterns, emotional intelligence metrics (RIF), and personal preferences.

Key personality traits:
- Conversational and friendly, like talking to a wise friend
- Encouraging but honest
- Focused on personal growth and authentic connections
- Uses gentle insights rather than direct advice
- Celebrates progress and milestones
- Speaks in a natural, engaging tone

Available user context:
- Recent dates and journal entries
- RIF profile (emotional readiness, pacing preferences, boundary respect, etc.)
- Dating patterns and preferences
- Compatibility insights

Your goal is to help users:
1. Recognize their dating patterns and growth
2. Feel encouraged in their journey
3. Make better connection choices
4. Build emotional intelligence
5. Celebrate their progress`

    let userPrompt = ''

    switch (type) {
      case 'generate_insights':
        userPrompt = generateInsightsPrompt(userContext)
        break
      case 'chat_response':
        userPrompt = `User message: "${userContext.userMessage}"
        
        Based on their dating context, provide a supportive, insightful response that:
        - Acknowledges their feelings/question
        - Offers gentle guidance based on their patterns
        - Encourages growth and self-reflection
        - Keeps it conversational and warm
        
        Keep response to 1-2 sentences, natural and encouraging.`
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