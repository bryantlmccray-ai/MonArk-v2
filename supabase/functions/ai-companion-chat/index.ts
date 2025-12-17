import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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

// Pre-built responses for MVP - no external AI required
const INSIGHT_RESPONSES = [
  "Based on your recent dates, you seem to connect well with people who value deep conversations.",
  "I noticed you've been more active this week! Your engagement is building great momentum.",
  "Your dating style shows you prefer quality over quantity - that's a great approach!",
  "You seem most energized after dates with creative activities. Consider more of those!",
  "Your reflections show growth in how you communicate your needs - keep it up!",
]

const CHAT_RESPONSES: Record<string, string[]> = {
  default: [
    "That's a great question! Based on what I know about your dating journey, I'd suggest focusing on authentic connections.",
    "I hear you! Remember, dating is a journey and every experience teaches us something valuable.",
    "Thanks for sharing that with me. It sounds like you're being really thoughtful about this.",
    "Great insight! Self-awareness like this is key to finding meaningful connections.",
  ],
  nervous: [
    "It's completely normal to feel nervous! Take a deep breath - you've got this.",
    "First date jitters are so common. Remember, they're probably feeling the same way!",
    "Being nervous just means you care. That's actually a good thing!",
  ],
  excited: [
    "Love the energy! Your excitement is contagious and will make for a great date.",
    "That's wonderful! Enjoy the moment and let your genuine self shine through.",
    "So happy for you! This positive energy will definitely come across.",
  ],
}

const CELEBRATION_RESPONSES = [
  "Amazing! You're making real progress on your dating journey. Keep it up! 🎉",
  "Congratulations! Every step forward is worth celebrating. You're doing great! ✨",
  "Wonderful news! Your intentional approach to dating is really paying off! 💫",
  "That's fantastic! Moments like these make the journey worthwhile. 🌟",
]

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
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    console.log('AI Companion request for user:', user.id)
    const requestData = await req.json()
    const { type, userContext }: CompanionRequest = requestData
    
    console.log('Request type:', type)

    let message: string

    switch (type) {
      case 'generate_insights':
        // Pick a random insight, optionally personalized by total dates
        const insightIndex = userContext?.totalDates 
          ? Math.min(userContext.totalDates, INSIGHT_RESPONSES.length - 1)
          : Math.floor(Math.random() * INSIGHT_RESPONSES.length)
        message = INSIGHT_RESPONSES[insightIndex]
        break
      
      case 'chat_response':
        // Simple keyword-based response selection
        const userMsg = (userContext?.userMessage || '').toLowerCase()
        let responseCategory = 'default'
        
        if (userMsg.includes('nervous') || userMsg.includes('anxious') || userMsg.includes('scared')) {
          responseCategory = 'nervous'
        } else if (userMsg.includes('excited') || userMsg.includes('happy') || userMsg.includes('great')) {
          responseCategory = 'excited'
        }
        
        const responses = CHAT_RESPONSES[responseCategory]
        message = responses[Math.floor(Math.random() * responses.length)]
        break
      
      case 'celebration':
        message = CELEBRATION_RESPONSES[Math.floor(Math.random() * CELEBRATION_RESPONSES.length)]
        break
      
      default:
        message = "I'm here to help with your dating journey. What would you like to know?"
    }

    console.log('Returning message:', message)

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate response',
        message: "I'm here to support you on your dating journey!",
        details: error.message 
      }),
      {
        status: 200, // Return 200 with fallback message
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
