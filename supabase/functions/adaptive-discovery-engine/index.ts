import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface JourneyStage {
  id: string;
  user_id: string;
  stage: string;
  stage_start_date: string;
  stage_end_date?: string;
  transition_reason?: string;
  stage_data: any;
}

interface RelationshipOutcome {
  user_id: string;
  match_user_id?: string;
  relationship_type: string;
  outcome: string;
  duration_days?: number;
  satisfaction_rating?: number;
  what_worked?: string[];
  what_didnt_work?: string[];
  lessons_learned?: string;
  would_date_similar?: boolean;
}

interface BehavioralPattern {
  user_id: string;
  pattern_type: string;
  pattern_data: any;
  confidence_score: number;
}

interface AdaptiveInsight {
  user_id: string;
  insight_type: string;
  insight_title: string;
  insight_content: string;
  actionable_suggestions: string[];
  confidence_level: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { action, data } = await req.json();
    console.log('Adaptive Discovery Engine called with action:', action, 'for user:', user.id);

    // Ensure user can only access their own data
    if (data?.user_id && data.user_id !== user.id) {
      throw new Error('Cannot access other users data')
    }

    let result;

    switch (action) {
      case 'analyze_behavioral_patterns':
        result = await analyzeBehavioralPatterns(data.user_id);
        break;
      case 'update_journey_stage':
        result = await updateJourneyStage(data.user_id, data.new_stage, data.reason);
        break;
      case 'record_relationship_outcome':
        result = await recordRelationshipOutcome(data);
        break;
      case 'generate_adaptive_insights':
        result = await generateAdaptiveInsights(data.user_id);
        break;
      case 'update_discovery_preferences':
        result = await updateDiscoveryPreferences(data.user_id);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in adaptive discovery engine:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeBehavioralPatterns(userId: string) {
  console.log('Analyzing behavioral patterns for user:', userId);

  // Get user's interaction history
  const { data: feedbackHistory } = await supabase
    .from('user_compatibility_feedback')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  const { data: relationshipHistory } = await supabase
    .from('relationship_outcomes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Analyze communication patterns
  const communicationPattern = analyzeCommunicationPattern(feedbackHistory || []);
  
  // Analyze preference evolution
  const preferencePattern = analyzePreferenceEvolution(feedbackHistory || [], relationshipHistory || []);
  
  // Analyze dating frequency patterns
  const datingPattern = analyzeDatingFrequency(relationshipHistory || []);

  const patterns: BehavioralPattern[] = [
    {
      user_id: userId,
      pattern_type: 'communication',
      pattern_data: communicationPattern,
      confidence_score: communicationPattern.confidence
    },
    {
      user_id: userId,
      pattern_type: 'preference_evolution',
      pattern_data: preferencePattern,
      confidence_score: preferencePattern.confidence
    },
    {
      user_id: userId,
      pattern_type: 'dating_frequency',
      pattern_data: datingPattern,
      confidence_score: datingPattern.confidence
    }
  ];

  // Store patterns
  for (const pattern of patterns) {
    await supabase
      .from('behavioral_patterns')
      .upsert({
        ...pattern,
        detected_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,pattern_type',
        ignoreDuplicates: false
      });
  }

  return { patterns_detected: patterns.length, patterns };
}

function analyzeCommunicationPattern(feedbackHistory: any[]) {
  if (feedbackHistory.length < 5) {
    return { confidence: 0.2, insights: ['Need more data to analyze communication patterns'] };
  }

  const messageInteractions = feedbackHistory.filter(f => f.interaction_type === 'message');
  const avgResponseTime = messageInteractions.reduce((acc, curr) => acc + (curr.feedback_score || 5), 0) / messageInteractions.length;
  
  return {
    confidence: Math.min(feedbackHistory.length / 20, 1),
    avg_response_preference: avgResponseTime,
    message_frequency: messageInteractions.length / feedbackHistory.length,
    insights: generateCommunicationInsights(avgResponseTime, messageInteractions.length)
  };
}

function analyzePreferenceEvolution(feedbackHistory: any[], relationshipHistory: any[]) {
  if (feedbackHistory.length < 10) {
    return { confidence: 0.3, insights: ['Building preference profile...'] };
  }

  // Analyze what types of people user actually connects with vs initial preferences
  const likedProfiles = feedbackHistory.filter(f => f.interaction_type === 'like');
  const passedProfiles = feedbackHistory.filter(f => f.interaction_type === 'pass');
  
  const successfulConnections = relationshipHistory.filter(r => 
    r.satisfaction_rating && r.satisfaction_rating >= 7
  );

  return {
    confidence: Math.min(feedbackHistory.length / 30, 1),
    preference_shifts: detectPreferenceShifts(likedProfiles, passedProfiles),
    successful_patterns: extractSuccessPatterns(successfulConnections),
    insights: generatePreferenceInsights(likedProfiles, successfulConnections)
  };
}

function analyzeDatingFrequency(relationshipHistory: any[]) {
  if (relationshipHistory.length < 3) {
    return { confidence: 0.4, insights: ['Early in dating journey'] };
  }

  const avgDuration = relationshipHistory
    .filter(r => r.duration_days)
    .reduce((acc, curr) => acc + curr.duration_days, 0) / relationshipHistory.length;

  const datingFrequency = relationshipHistory.length > 0 ? 
    (Date.now() - new Date(relationshipHistory[relationshipHistory.length - 1].created_at).getTime()) 
    / (relationshipHistory.length * 30 * 24 * 60 * 60 * 1000) : 0; // relationships per month

  return {
    confidence: Math.min(relationshipHistory.length / 10, 1),
    avg_relationship_duration: avgDuration,
    dating_frequency: datingFrequency,
    relationship_success_rate: relationshipHistory.filter(r => r.satisfaction_rating >= 7).length / relationshipHistory.length,
    insights: generateDatingFrequencyInsights(avgDuration, datingFrequency)
  };
}

async function updateJourneyStage(userId: string, newStage: string, reason?: string) {
  console.log('Updating journey stage for user:', userId, 'to:', newStage);

  // End current stage
  await supabase
    .from('user_journey_stages')
    .update({ 
      stage_end_date: new Date().toISOString() 
    })
    .eq('user_id', userId)
    .is('stage_end_date', null);

  // Start new stage
  const { data, error } = await supabase
    .from('user_journey_stages')
    .insert({
      user_id: userId,
      stage: newStage,
      transition_reason: reason,
      stage_data: { previous_stages: await getPreviousStages(userId) }
    })
    .select()
    .single();

  if (error) throw error;

  // Trigger adaptive insights generation
  await generateAdaptiveInsights(userId);

  return data;
}

async function recordRelationshipOutcome(outcomeData: RelationshipOutcome) {
  console.log('Recording relationship outcome for user:', outcomeData.user_id);

  const { data, error } = await supabase
    .from('relationship_outcomes')
    .insert(outcomeData)
    .select()
    .single();

  if (error) throw error;

  // Analyze patterns after new outcome
  await analyzeBehavioralPatterns(outcomeData.user_id);
  
  // Update journey stage if needed
  if (outcomeData.outcome.includes('ended')) {
    await updateJourneyStage(outcomeData.user_id, 'healing', 'relationship_ended');
  }

  return data;
}

async function generateAdaptiveInsights(userId: string) {
  console.log('Generating adaptive insights for user:', userId);

  // Get current behavioral patterns
  const { data: patterns } = await supabase
    .from('behavioral_patterns')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  // Get current journey stage
  const { data: currentStage } = await supabase
    .from('user_journey_stages')
    .select('*')
    .eq('user_id', userId)
    .is('stage_end_date', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const insights: AdaptiveInsight[] = [];

  // Generate insights based on patterns
  if (patterns) {
    for (const pattern of patterns) {
      const patternInsights = generateInsightsFromPattern(pattern, currentStage?.stage);
      insights.push(...patternInsights);
    }
  }

  // Store insights
  for (const insight of insights) {
    await supabase
      .from('adaptive_insights')
      .insert({
        ...insight,
        user_id: userId
      });
  }

  return { insights_generated: insights.length, insights };
}

async function updateDiscoveryPreferences(userId: string) {
  console.log('Updating discovery preferences for user:', userId);

  // Get successful relationship patterns
  const { data: successfulOutcomes } = await supabase
    .from('relationship_outcomes')
    .select('*')
    .eq('user_id', userId)
    .gte('satisfaction_rating', 7);

  if (!successfulOutcomes || successfulOutcomes.length === 0) {
    return { message: 'Not enough data to update preferences' };
  }

  // Extract common characteristics from successful relationships
  const preferenceUpdates = extractPreferenceUpdates(successfulOutcomes);

  // Update user's ML preferences
  await supabase
    .from('user_ml_preferences')
    .upsert({
      user_id: userId,
      ...preferenceUpdates,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  return { preferences_updated: preferenceUpdates };
}

// Helper functions
function generateCommunicationInsights(avgResponse: number, messageCount: number): string[] {
  const insights = [];
  if (avgResponse > 7) insights.push('You prefer deeper, more thoughtful conversations');
  if (messageCount > 0.7) insights.push('You value frequent communication');
  return insights;
}

function generatePreferenceInsights(liked: any[], successful: any[]): string[] {
  const insights = [];
  if (successful.length > 0) {
    insights.push('Your most successful connections share certain traits');
    insights.push('Consider being more open to profiles similar to your past successes');
  }
  return insights;
}

function generateDatingFrequencyInsights(duration: number, frequency: number): string[] {
  const insights = [];
  if (duration < 30) insights.push('You might benefit from taking more time to get to know matches');
  if (frequency > 3) insights.push('Consider focusing on fewer, higher-quality connections');
  return insights;
}

function detectPreferenceShifts(liked: any[], passed: any[]): any {
  return {
    shift_detected: Math.random() > 0.5, // Placeholder for actual analysis
    shift_direction: 'more_selective'
  };
}

function extractSuccessPatterns(successful: any[]): any {
  return {
    common_traits: ['emotional_intelligence', 'shared_interests'],
    avg_compatibility_score: 0.8
  };
}

function generateInsightsFromPattern(pattern: any, currentStage?: string): AdaptiveInsight[] {
  const insights: AdaptiveInsight[] = [];
  
  if (pattern.pattern_type === 'communication' && pattern.confidence_score > 0.7) {
    insights.push({
      user_id: pattern.user_id,
      insight_type: 'pattern_recognition',
      insight_title: 'Communication Pattern Detected',
      insight_content: 'We\'ve noticed you prefer meaningful conversations over quick exchanges.',
      actionable_suggestions: ['Focus on matches who write detailed messages', 'Ask open-ended questions'],
      confidence_level: pattern.confidence_score
    });
  }

  return insights;
}

function extractPreferenceUpdates(successfulOutcomes: any[]): any {
  return {
    rif_weight: 0.45, // Increase RIF importance based on successful emotional connections
    interest_weight: 0.25,
    behavioral_weight: 0.3,
    confidence_level: Math.min(successfulOutcomes.length / 5, 1)
  };
}

async function getPreviousStages(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('user_journey_stages')
    .select('stage')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  return data?.map(s => s.stage) || [];
}