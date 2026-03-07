import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (!user) {
      throw new Error('Unauthorized')
    }

    const { user_id } = await req.json()

    // Get user's feedback history for learning
    const { data: feedbackData } = await supabaseClient
      .from('user_compatibility_feedback')
      .select(`
        *,
        target_profiles:user_profiles!user_compatibility_feedback_target_user_id_fkey(*)
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (!feedbackData?.length) {
      return new Response(
        JSON.stringify({ message: 'Insufficient feedback data for training' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Analyze patterns in user's feedback
    const patterns = analyzeUserPatterns(feedbackData)
    
    // Update user's personalized ML weights
    await updatePersonalizedWeights(supabaseClient, user_id, patterns)
    
    // Generate insights for the user
    const insights = generatePersonalizedInsights(patterns)
    
    // Store insights
    if (insights.length > 0) {
      await supabaseClient
        .from('rif_insights')
        .insert(
          insights.map(insight => ({
            user_id: user_id,
            insight_type: 'ml_learning',
            title: insight.title,
            content: insight.content,
            delivered: false
          }))
        )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        patterns_analyzed: patterns,
        insights_generated: insights.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('ML Trainer Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

function analyzeUserPatterns(feedbackData: any[]): any {
  const patterns = {
    preferred_interaction_style: 'balanced',
    interest_weight_preference: 0.3,
    rif_weight_preference: 0.4,
    behavioral_weight_preference: 0.3,
    activity_preference: 'moderate',
    learning_confidence: 0.5
  }

  // Analyze interaction preferences
  const interactionCounts = feedbackData.reduce((acc, feedback) => {
    acc[feedback.interaction_type] = (acc[feedback.interaction_type] || 0) + 1
    return acc
  }, {})

  const totalInteractions = feedbackData.length
  
  // Determine interaction style preference
  if (interactionCounts.message > totalInteractions * 0.6) {
    patterns.preferred_interaction_style = 'conversation_focused'
    patterns.rif_weight_preference = 0.5  // Values emotional compatibility more
    patterns.behavioral_weight_preference = 0.3
    patterns.interest_weight_preference = 0.2
  } else if (interactionCounts.like > totalInteractions * 0.7) {
    patterns.preferred_interaction_style = 'attraction_focused'
    patterns.interest_weight_preference = 0.4  // Values shared interests more
    patterns.rif_weight_preference = 0.3
    patterns.behavioral_weight_preference = 0.3
  }

  // Analyze feedback scores to understand user's selectivity
  const avgFeedbackScore = feedbackData.reduce((sum, f) => sum + f.feedback_score, 0) / feedbackData.length
  
  if (avgFeedbackScore > 7) {
    patterns.activity_preference = 'selective'
  } else if (avgFeedbackScore < 4) {
    patterns.activity_preference = 'exploratory'
  }

  // Calculate learning confidence based on data volume and consistency
  patterns.learning_confidence = Math.min(1.0, feedbackData.length / 50) * 
    (1 - (calculateFeedbackVariance(feedbackData) / 25))

  return patterns
}

function calculateFeedbackVariance(feedbackData: any[]): number {
  const scores = feedbackData.map(f => f.feedback_score)
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
  return variance
}

async function updatePersonalizedWeights(supabaseClient: any, userId: string, patterns: any) {
  // Store personalized ML weights for this user
  await supabaseClient
    .from('user_ml_preferences')
    .upsert({
      user_id: userId,
      interest_weight: patterns.interest_weight_preference,
      rif_weight: patterns.rif_weight_preference,
      behavioral_weight: patterns.behavioral_weight_preference,
      interaction_style: patterns.preferred_interaction_style,
      activity_preference: patterns.activity_preference,
      confidence_level: patterns.learning_confidence,
      updated_at: new Date().toISOString()
    })
}

function generatePersonalizedInsights(patterns: any): any[] {
  const insights = []

  if (patterns.learning_confidence > 0.7) {
    if (patterns.preferred_interaction_style === 'conversation_focused') {
      insights.push({
        title: "Deep Connection Preference Detected",
        content: "Our AI noticed you prefer meaningful conversations over quick matches. We're now prioritizing emotional compatibility in your recommendations."
      })
    }
    
    if (patterns.activity_preference === 'selective') {
      insights.push({
        title: "Quality Over Quantity",
        content: "You tend to be selective in your connections. We're focusing on showing you fewer, but higher-quality matches that align with your preferences."
      })
    }
    
    if (patterns.interest_weight_preference > 0.4) {
      insights.push({
        title: "Shared Interests Matter to You",
        content: "Our analysis shows you value shared hobbies and interests highly. We're emphasizing interest compatibility in your match suggestions."
      })
    }
  }

  return insights
}