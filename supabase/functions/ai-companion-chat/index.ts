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
    console.log('=== AI COMPANION FUNCTION START ===')
    const { type, userContext }: CompanionRequest = await req.json()
    console.log('Received request:', { type, userContext })
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    console.log('OpenAI API key exists:', !!openaiApiKey)
    console.log('OpenAI API key length:', openaiApiKey?.length || 0)
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment')
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Test OpenAI connection with a simple request
    console.log('Testing OpenAI connection...')
    const testResponse = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
    })
    
    console.log('OpenAI test response status:', testResponse.status)
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text()
      console.error('OpenAI API test failed:', errorText)
      return new Response(JSON.stringify({ 
        error: 'OpenAI API connection failed',
        details: errorText 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    console.log('OpenAI connection successful!')
    
    // If we get here, the API key works, so return a simple success message for now
    return new Response(JSON.stringify({ 
      message: "Connection test successful! OpenAI API is working." 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('=== ERROR IN AI COMPANION ===')
    console.error('Error details:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate AI response',
        details: error.message 
      }),
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