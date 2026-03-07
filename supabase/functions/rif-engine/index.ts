
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

    const { action, data } = await req.json()

    switch (action) {
      case 'process_feedback':
        return await processFeedback(supabaseClient, user.id, data)
      case 'generate_recommendations':
        return await generateRecommendations(supabaseClient, user.id, data)
      case 'calculate_compatibility':
        return await calculateCompatibility(supabaseClient, user.id, data)
      case 'ml_compatibility_score':
        return await calculateMLCompatibility(supabaseClient, user.id, data)
      case 'cluster_interests':
        return await clusterInterests(supabaseClient, user.id, data)
      case 'behavioral_analysis':
        return await analyzeBehavioralPatterns(supabaseClient, user.id, data)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('RIF Engine Error:', error)
    return new Response(
      JSON.stringify({ error: 'An internal error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
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

// ML-Enhanced Compatibility Scoring
async function calculateMLCompatibility(supabaseClient: any, userId: string, data: any) {
  console.log('Calculating ML-enhanced compatibility for user:', userId)
  
  // Get user profiles and RIF data
  const { data: userProfile } = await supabaseClient
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  const { data: targetProfile } = await supabaseClient
    .from('user_profiles')
    .select('*')
    .eq('user_id', data.target_user_id)
    .single()

  const { data: userRIF } = await supabaseClient
    .from('rif_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  const { data: targetRIF } = await supabaseClient
    .from('rif_profiles')
    .select('*')
    .eq('user_id', data.target_user_id)
    .eq('is_active', true)
    .single()

  // Get historical feedback for learning
  const { data: feedback } = await supabaseClient
    .from('user_compatibility_feedback')
    .select('*')
    .eq('user_id', userId)

  // Calculate enhanced compatibility scores
  const interestSimilarity = calculateInterestSimilarity(
    userProfile?.interests || [], 
    targetProfile?.interests || []
  )

  const behavioralAlignment = calculateBehavioralAlignment(userRIF, targetRIF)
  const rifCompatibility = userRIF && targetRIF ? 
    calculateRIFCompatibility(userRIF, targetRIF).overall_compatibility : 0.5

  // Apply ML learning weights based on historical feedback
  const personalizedWeights = calculatePersonalizedWeights(feedback)
  
  const mlScore = 
    (rifCompatibility * personalizedWeights.rif) +
    (interestSimilarity * personalizedWeights.interests) +
    (behavioralAlignment * personalizedWeights.behavioral)

  return new Response(
    JSON.stringify({
      success: true,
      ml_compatibility: {
        overall_score: mlScore,
        rif_compatibility: rifCompatibility,
        interest_similarity: interestSimilarity,
        behavioral_alignment: behavioralAlignment,
        confidence: calculateConfidence(userProfile, targetProfile, userRIF, targetRIF),
        personalized_weights: personalizedWeights
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Interest-based clustering
async function clusterInterests(supabaseClient: any, userId: string, data: any) {
  console.log('Clustering interests for user:', userId)
  
  // Get all users' interests
  const { data: allProfiles } = await supabaseClient
    .from('user_profiles')
    .select('user_id, interests')
    .neq('user_id', userId)
    .not('interests', 'is', null)

  const { data: userProfile } = await supabaseClient
    .from('user_profiles')
    .select('interests')
    .eq('user_id', userId)
    .single()

  if (!userProfile?.interests || !allProfiles) {
    return new Response(
      JSON.stringify({ error: 'Insufficient data for clustering' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // Simple k-means clustering based on interest similarity
  const clusters = performInterestClustering(userProfile.interests, allProfiles)
  
  return new Response(
    JSON.stringify({
      success: true,
      clusters: clusters,
      user_cluster: findUserCluster(userProfile.interests, clusters)
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Behavioral pattern analysis
async function analyzeBehavioralPatterns(supabaseClient: any, userId: string, data: any) {
  console.log('Analyzing behavioral patterns for user:', userId)
  
  // Get user's RIF feedback history
  const { data: feedback } = await supabaseClient
    .from('rif_feedback')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // Get user's interaction patterns
  const { data: interactions } = await supabaseClient
    .from('user_compatibility_feedback')
    .select('*')
    .eq('user_id', userId)

  if (!feedback?.length && !interactions?.length) {
    return new Response(
      JSON.stringify({ error: 'Insufficient behavioral data' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  const patterns = analyzeBehavioralData(feedback, interactions)
  
  return new Response(
    JSON.stringify({
      success: true,
      behavioral_patterns: patterns
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Helper functions for ML calculations
function calculateInterestSimilarity(interests1: string[], interests2: string[]): number {
  if (!interests1?.length || !interests2?.length) return 0
  
  const set1 = new Set(interests1.map(i => i.toLowerCase()))
  const set2 = new Set(interests2.map(i => i.toLowerCase()))
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  return intersection.size / union.size
}

function calculateBehavioralAlignment(rif1: any, rif2: any): number {
  if (!rif1 || !rif2) return 0.5

  const dimensions = ['intent_clarity', 'pacing_preferences', 'emotional_readiness', 'boundary_respect']
  let totalAlignment = 0
  let weightSum = 0

  dimensions.forEach(dim => {
    const score1 = rif1[dim] || 0
    const score2 = rif2[dim] || 0
    const alignment = 1 - Math.abs(score1 - score2) / 10
    const weight = dim === 'boundary_respect' ? 1.5 : dim === 'emotional_readiness' ? 1.3 : 1.0
    
    totalAlignment += alignment * weight
    weightSum += weight
  })

  return totalAlignment / weightSum
}

function calculatePersonalizedWeights(feedback: any[]): any {
  // Default weights
  const defaultWeights = { rif: 0.4, interests: 0.3, behavioral: 0.3 }
  
  if (!feedback?.length) return defaultWeights

  // Analyze user's historical preferences to adjust weights
  const interactionTypes = feedback.reduce((acc, f) => {
    acc[f.interaction_type] = (acc[f.interaction_type] || 0) + 1
    return acc
  }, {})

  // Adjust weights based on user behavior patterns
  if (interactionTypes.message > interactionTypes.like) {
    return { rif: 0.5, interests: 0.3, behavioral: 0.2 } // Values deeper connections
  } else if (interactionTypes.like > interactionTypes.message * 2) {
    return { rif: 0.3, interests: 0.4, behavioral: 0.3 } // Values shared interests
  }

  return defaultWeights
}

function calculateConfidence(userProfile: any, targetProfile: any, userRIF: any, targetRIF: any): number {
  const dataPoints = [
    userProfile?.interests?.length > 0,
    targetProfile?.interests?.length > 0,
    userRIF !== null,
    targetRIF !== null,
    userProfile?.photos?.length > 0,
    targetProfile?.photos?.length > 0
  ]
  
  return dataPoints.filter(Boolean).length / dataPoints.length
}

function performInterestClustering(userInterests: string[], allProfiles: any[]): any[] {
  // Simple clustering algorithm - group users by interest similarity
  const clusters = []
  const processed = new Set()
  
  allProfiles.forEach(profile => {
    if (processed.has(profile.user_id)) return
    
    const similarity = calculateInterestSimilarity(userInterests, profile.interests || [])
    
    // Find or create cluster
    let cluster = clusters.find(c => 
      Math.abs(c.averageSimilarity - similarity) < 0.2
    )
    
    if (!cluster) {
      cluster = {
        id: clusters.length,
        members: [],
        averageSimilarity: similarity,
        commonInterests: []
      }
      clusters.push(cluster)
    }
    
    cluster.members.push(profile.user_id)
    processed.add(profile.user_id)
  })
  
  return clusters
}

function findUserCluster(userInterests: string[], clusters: any[]): number {
  let bestCluster = 0
  let bestSimilarity = 0
  
  clusters.forEach((cluster, index) => {
    if (cluster.averageSimilarity > bestSimilarity) {
      bestSimilarity = cluster.averageSimilarity
      bestCluster = index
    }
  })
  
  return bestCluster
}

function analyzeBehavioralData(feedback: any[], interactions: any[]): any {
  const patterns = {
    dating_pace: 'moderate',
    communication_style: 'balanced',
    commitment_readiness: 'exploring',
    interaction_preferences: {},
    growth_trajectory: 'stable'
  }
  
  if (feedback?.length) {
    // Analyze RIF feedback patterns
    const avgPacing = feedback.reduce((sum, f) => 
      sum + (f.data?.responses?.pacing_comfort || 5), 0) / feedback.length
    
    patterns.dating_pace = avgPacing < 4 ? 'slow' : avgPacing > 7 ? 'fast' : 'moderate'
    
    const recentFeedback = feedback.slice(0, 5)
    const olderFeedback = feedback.slice(5, 10)
    
    if (recentFeedback.length && olderFeedback.length) {
      const recentAvg = recentFeedback.reduce((sum, f) => 
        sum + (f.data?.responses?.emotional_readiness || 5), 0) / recentFeedback.length
      const olderAvg = olderFeedback.reduce((sum, f) => 
        sum + (f.data?.responses?.emotional_readiness || 5), 0) / olderFeedback.length
      
      patterns.growth_trajectory = recentAvg > olderAvg ? 'improving' : 
                                   recentAvg < olderAvg ? 'declining' : 'stable'
    }
  }
  
  if (interactions?.length) {
    // Analyze interaction patterns
    patterns.interaction_preferences = interactions.reduce((acc, i) => {
      acc[i.interaction_type] = (acc[i.interaction_type] || 0) + 1
      return acc
    }, {})
  }
  
  return patterns
}
