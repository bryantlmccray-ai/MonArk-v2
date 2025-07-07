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
    console.log('Function started')
    const requestData = await req.json()
    console.log('Request data:', JSON.stringify(requestData))
    
    const { type, userContext }: CompanionRequest = requestData
    
    const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Google Gemini API key not configured')
    }

    const systemPrompt = `You are Ark, a helpful AI dating companion. You provide warm, empathetic advice about dating and relationships. Keep responses conversational and supportive.`

    let userPrompt = ''
    if (type === 'chat_response') {
      userPrompt = `User message: "${userContext.userMessage}"
      
      User has ${userContext.totalDates || 0} dates logged and interests in: ${userContext.interests?.join(', ') || 'not specified'}.
      
      Provide a helpful, encouraging response about their dating question.`
    } else {
      userPrompt = 'Provide encouraging dating advice for someone just starting their dating journey.'
    }

    console.log('Making Gemini request...')
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 300,
        }
      }),
    })

    console.log('Gemini response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini error:', errorData)
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid Gemini response format')
    }
    
    const aiMessage = data.candidates[0].content.parts[0].text
    console.log('AI response generated successfully')

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Function error:', error)
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