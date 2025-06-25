
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { action, data } = await req.json()

    switch (action) {
      case 'process_feedback':
        return await processFeedback(supabaseClient, user.id, data)
      case 'generate_recommendations':
        return await generateRecommendations(supabaseClient, user.id, data)
      case 'calculate_compatibility':
        return await calculateCompatibility(supabaseClient, user.id, data)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('RIF Engine Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

async function processFeedback(supabaseClient: any, userId: string, feedbackData: any) {
  console.log('Processing RIF feedback for user:', userId)
  
  // Get unprocessed feedback
  const { data: feedback } = await supabaseClient
    .from('rif_feedback')
    .select('*')
    .eq('user_id', userId)
    .eq('processed', false)

  if (!feedback || feedback.length === 0) {
    return new Response(
      JSON.stringify({ message: 'No unprocessed feedback found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Calculate RIF scores
  const rifScores = calculateRIFScores(feedback)

  // Update or create RIF profile
  await supabaseClient
    .from('rif_profiles')
    .upsert({
      user_id: userId,
      ...rifScores,
      updated_at: new Date().toISOString()
    })

  // Mark feedback as processed
  const feedbackIds = feedback.map(f => f.id)
  await supabaseClient
    .from('rif_feedback')
    .update({ processed: true })
    .in('id', feedbackIds)

  return new Response(
    JSON.stringify({ success: true, scores: rifScores }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function generateRecommendations(supabaseClient: any, userId: string, data: any) {
  console.log('Generating RIF recommendations for user:', userId)
  
  // Get user's RIF profile
  const { data: rifProfile } = await supabaseClient
    .from('rif_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (!rifProfile) {
    return new Response(
      JSON.stringify({ error: 'No RIF profile found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )
  }

  // Generate personalized recommendations
  const recommendations = generatePersonalizedRecommendations(rifProfile, data.type)

  // Store recommendations
  await supabaseClient
    .from('rif_recommendations')
    .insert(
      recommendations.map(rec => ({
        user_id: userId,
        recommendation_type: data.type,
        content: rec,
        delivered: false
      }))
    )

  return new Response(
    JSON.stringify({ success: true, recommendations }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function calculateCompatibility(supabaseClient: any, userId: string, data: any) {
  console.log('Calculating RIF compatibility for user:', userId)
  
  // Get user's RIF profile
  const { data: userProfile } = await supabaseClient
    .from('rif_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  // Get potential match's RIF profile
  const { data: matchProfile } = await supabaseClient
    .from('rif_profiles')
    .select('*')
    .eq('user_id', data.match_user_id)
    .eq('is_active', true)
    .single()

  if (!userProfile || !matchProfile) {
    return new Response(
      JSON.stringify({ error: 'RIF profiles not found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )
  }

  const compatibility = calculateRIFCompatibility(userProfile, matchProfile)

  return new Response(
    JSON.stringify({ success: true, compatibility }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function calculateRIFScores(feedback: any[]): any {
  const scores = {
    intent_clarity: 0,
    pacing_preferences: 0,
    emotional_readiness: 0,
    boundary_respect: 0,
    post_date_alignment: 0
  }

  let totalWeight = 0

  feedback.forEach(fb => {
    const data = fb.data.responses
    const weight = getWeightForFeedbackType(fb.feedback_type)
    totalWeight += weight

    // Map feedback responses to RIF dimensions
    if (data.intent_clarity) scores.intent_clarity += data.intent_clarity * weight
    if (data.pacing_comfort || data.pace_alignment) {
      scores.pacing_preferences += (data.pacing_comfort || data.pace_alignment) * weight
    }
    if (data.emotional_availability || data.emotional_state) {
      scores.emotional_readiness += (data.emotional_availability || data.emotional_state) * weight
    }
    if (data.boundary_communication || data.boundaries_respected) {
      scores.boundary_respect += (data.boundary_communication || data.boundaries_respected) * weight
    }
    if (data.reflection_habits || data.connection_felt) {
      scores.post_date_alignment += (data.reflection_habits || data.connection_felt) * weight
    }
  })

  // Normalize scores
  if (totalWeight > 0) {
    Object.keys(scores).forEach(key => {
      scores[key] = Math.min(10, Math.max(0, scores[key] / totalWeight))
    })
  }

  return scores
}

function getWeightForFeedbackType(type: string): number {
  switch (type) {
    case 'onboarding': return 1.0
    case 'post_date': return 0.8
    case 'check_in': return 0.5
    case 'behavioral': return 0.3
    default: return 0.1
  }
}

function generatePersonalizedRecommendations(rifProfile: any, type: string): any[] {
  const recommendations = []

  switch (type) {
    case 'date_suggestion':
      if (rifProfile.pacing_preferences < 5) {
        recommendations.push({
          title: "Gentle Pacing Date",
          description: "Consider a low-pressure coffee date to match your preferred pace",
          priority: "high"
        })
      }
      if (rifProfile.emotional_readiness > 7) {
        recommendations.push({
          title: "Deeper Connection Activity",
          description: "You seem emotionally ready - try a meaningful shared experience",
          priority: "medium"
        })
      }
      break

    case 'reflection_prompt':
      if (rifProfile.post_date_alignment < 6) {
        recommendations.push({
          title: "Post-Date Reflection",
          description: "How did this date align with what you're looking for?",
          priority: "high"
        })
      }
      break

    case 'match_filter':
      recommendations.push({
        title: "Compatible Pace Matching",
        description: `Prioritize matches with similar pacing preferences (${rifProfile.pacing_preferences}/10)`,
        priority: "high"
      })
      break
  }

  return recommendations
}

function calculateRIFCompatibility(profile1: any, profile2: any): any {
  const dimensions = ['intent_clarity', 'pacing_preferences', 'emotional_readiness', 'boundary_respect', 'post_date_alignment']
  
  let totalCompatibility = 0
  const dimensionScores = {}

  dimensions.forEach(dim => {
    const score1 = profile1[dim] || 0
    const score2 = profile2[dim] || 0
    const compatibility = 1 - Math.abs(score1 - score2) / 10
    dimensionScores[dim] = compatibility
    totalCompatibility += compatibility
  })

  return {
    overall_compatibility: totalCompatibility / dimensions.length,
    dimension_scores: dimensionScores,
    recommendation: totalCompatibility / dimensions.length > 0.7 ? 'high_compatibility' : 
                   totalCompatibility / dimensions.length > 0.5 ? 'moderate_compatibility' : 'low_compatibility'
  }
}
