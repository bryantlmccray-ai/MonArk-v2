/**
 * compatibility-feedback-trainer
 *
 * NOTE: Despite the legacy "ml-compatibility-trainer" folder name, this function
 * does NOT implement a machine-learning model. There is no trained embedding model,
 * vector database, or model-versioning system here. This function performs
 * rule-based, weighted pattern analysis on user feedback to adjust per-user
 * compatibility weights. It is accurately described as an "AI-powered feature"
 * backed by individual OpenAI API calls — not an agentic AI system or LLM
 * orchestration framework (no LangChain, LlamaIndex, CrewAI, or similar).
 *
 * What this function actually does:
 * - Reads user feedback records from `rif_feedback`
 * - Analyzes interaction patterns (message frequency, like ratio, avg scores)
 * - Updates per-user weight preferences in `user_compatibility_feedback`
 * - Generates plain-text insights stored in `rif_insights`
 *
 * The matching logic is rule/weight-based today, with ML aspirations for v3.
 */
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
              // SECURITY FIX: Proper auth with null-safety
      const authHeader = req.headers.get('Authorization')
              if (!authHeader) {
                      return new Response(
                                JSON.stringify({ error: 'Authentication required' }),
                        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                              )
              }

      const supabaseClient = createClient(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
            )

      const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
              if (authError || !user) {
                      return new Response(
                                JSON.stringify({ error: 'Invalid authentication' }),
                        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                              )
              }

      const userId = user.id

      // Get user's recent feedback for weight-adjustment analysis
      const { data: feedbackData, error: feedbackError } = await supabaseClient
                .from('rif_feedback')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50)

      if (feedbackError) {
              throw feedbackError
      }

      if (!feedbackData || feedbackData.length < 3) {
              return new Response(
                        JSON.stringify({ 
                                                 success: true, 
                                    message: 'Insufficient feedback data for weight adjustment — need at least 3 interactions',
                                    patterns_analyzed: null,
                                    insights_generated: 0
                        }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                      )
      }

      // Rule-based pattern analysis (not ML training)
      const patterns = analyzeUserPatterns(feedbackData)

      // Update user's personalized compatibility weights
      await updatePersonalizedWeights(supabaseClient, userId, patterns)

      // Generate plain-text insights based on patterns
      const insights = generatePersonalizedInsights(patterns)

      // Store insights
      if (insights.length > 0) {
              await supabaseClient
                .from('rif_insights')
                .insert(
                            insights.map(insight => ({
                                          user_id: userId,
                                          insight_type: 'weight_adjustment',
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
              console.error('Compatibility feedback trainer error:', error)
              return new Response(
                      JSON.stringify({ error: 'An internal error occurred' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    )
        }
})

/**
   * analyzeUserPatterns
   * Rule-based analysis of user feedback to derive weight preferences.
   * This is NOT a trained model — it applies deterministic thresholds on
   * interaction counts and average scores.
   */
function analyzeUserPatterns(feedbackData: any[]): any {
    const patterns: any = {
          preferred_interaction_style: 'balanced',
          interest_weight_preference: 0.3,
          rif_weight_preference: 0.4,
          behavioral_weight_preference: 0.3,
          activity_preference: 'moderate',
          learning_confidence: 0.5
    }

  const interactionCounts = feedbackData.reduce((acc: any, feedback: any) => {
        acc[feedback.interaction_type] = (acc[feedback.interaction_type] || 0) + 1
        return acc
  }, {})

  const totalInteractions = feedbackData.length

  if (interactionCounts.message > totalInteractions * 0.6) {
        patterns.preferred_interaction_style = 'conversation_focused'
        patterns.rif_weight_preference = 0.5
        patterns.behavioral_weight_preference = 0.3
        patterns.interest_weight_preference = 0.2
  } else if (interactionCounts.like > totalInteractions * 0.7) {
        patterns.preferred_interaction_style = 'attraction_focused'
        patterns.interest_weight_preference = 0.4
        patterns.rif_weight_preference = 0.3
        patterns.behavioral_weight_preference = 0.3
  }

  const avgFeedbackScore = feedbackData.reduce((sum: number, f: any) => sum + (f.feedback_score || 5), 0) / totalInteractions
    patterns.learning_confidence = Math.min(0.9, totalInteractions / 50)

  if (avgFeedbackScore > 7) {
        patterns.activity_preference = 'high'
  } else if (avgFeedbackScore < 4) {
        patterns.activity_preference = 'low'
  }

  return patterns
}

/**
 * updatePersonalizedWeights
 * Writes the computed weight preferences back to the database.
 */
async function updatePersonalizedWeights(supabaseClient: any, userId: string, patterns: any) {
    await supabaseClient
      .from('user_compatibility_feedback')
      .upsert({
              user_id: userId,
              interest_weight: patterns.interest_weight_preference,
              rif_weight: patterns.rif_weight_preference,
              behavioral_weight: patterns.behavioral_weight_preference,
              interaction_style: patterns.preferred_interaction_style,
              updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
}

/**
 * generatePersonalizedInsights
 * Produces human-readable insight strings from the pattern data.
 * No LLM call — these are deterministic template strings.
 */
function generatePersonalizedInsights(patterns: any): any[] {
    const insights: any[] = []

        if (patterns.preferred_interaction_style === 'conversation_focused') {
              insights.push({
                      title: 'Your Matching Style: Conversation-First',
                      content: 'Based on your interactions, you connect best through meaningful conversation. Your matches are weighted to prioritize communication compatibility.'
              })
        } else if (patterns.preferred_interaction_style === 'attraction_focused') {
              insights.push({
                      title: 'Your Matching Style: Attraction-Led',
                      content: 'You tend to engage based on initial attraction signals. Your matches reflect stronger interest alignment.'
              })
        }

  if (patterns.activity_preference === 'high') {
        insights.push({
                title: 'High Engagement Pattern',
                content: 'You have been highly active with your matches. Keep the momentum going.'
        })
  }

  return insights
}
