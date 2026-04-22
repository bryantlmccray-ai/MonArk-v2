import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type WeeklyRhythm = 'reset' | 'spark' | 'stretch'

interface RIFProfile {
    user_id: string
    intent_clarity: number        // 1-10
  pacing_preferences: number    // 1-10
  emotional_readiness: number   // 1-10
  boundary_respect: number      // 1-10
  post_date_alignment: number   // 1-10
}

interface UserProfile {
    user_id: string
    display_name: string
    bio: string
    interests: string[]
    age: number
    city: string
    neighborhood: string
    photos: string[]
    lifestyle: Record<string, any>
    identity: Record<string, any>
}

interface MLWeights {
    rif_weight: number
    interest_weight: number
    behavioral_weight: number
    interaction_style: string
    confidence_level: number
}

interface CompatibilityFeedback {
    target_user_id: string
    feedback_score: number        // 1-10
  interaction_type: string      // 'like' | 'pass' | 'message' | 'date'
  created_at: string
}

interface CurationInput {
    user_a_id: string
    user_b_id: string
    requester_id: string
    /** Optional: the requester's weekly rhythm for this week */
  requester_rhythm?: WeeklyRhythm | null
    /** Optional: the candidate's weekly rhythm for this week */
  candidate_rhythm?: WeeklyRhythm | null
}

interface CurationResult {
    should_match: boolean
    confidence: number            // 0-1
  compatibility_score: number   // 0-100
  match_reason: string
    internal_rationale: string
    rif_breakdown: Record<string, number>
    interest_overlap: string[]
    flags: string[]
    rhythm_aligned: boolean
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function getCurrentWeekStart(): string {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day
    const sunday = new Date(now.setDate(diff))
    sunday.setHours(0, 0, 0, 0)
    return sunday.toISOString().split('T')[0]
}

/** Fetch this week's rhythm for a given user from user_weekly_rhythm */
async function fetchWeeklyRhythm(supabase: any, userId: string): Promise<WeeklyRhythm | null> {
    const weekStart = getCurrentWeekStart()
    const { data } = await supabase
      .from('user_weekly_rhythm')
      .select('rhythm')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .maybeSingle()
    return data?.rhythm ?? null
}

// ─────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────
serve(async (req) => {
    if (req.method === 'OPTIONS') {
          return new Response('ok', { headers: corsHeaders })
    }

        try {
              const authHeader = req.headers.get('Authorization')
              if (!authHeader) {
                      return new Response(JSON.stringify({ error: 'Authentication required' }), {
                                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                                status: 401,
                      })
              }

      const supabase = createClient(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            )

      const anonClient = createClient(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
            )

      const { data: { user }, error: authError } = await anonClient.auth.getUser()
              if (authError || !user) {
                      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                                status: 401,
                      })
              }

      const body = await req.json()
              const { action, data } = body

      switch (action) {
        case 'curate_pair':
                  return await curatePair(supabase, data as CurationInput)
        case 'batch_curate':
                  return await batchCurate(supabase, data)
        default:
                  throw new Error('Invalid action: ' + action)
      }
        } catch (err) {
              console.error('ai-match-curator error:', err)
              return new Response(JSON.stringify({ error: 'Internal error' }), {
                      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                      status: 500,
              })
        }
})

// ─────────────────────────────────────────────
// Core: curate a single candidate pair
// ─────────────────────────────────────────────
async function curatePair(supabase: any, input: CurationInput): Promise<Response> {
    const { user_a_id, user_b_id, requester_id } = input

  // 1. Fetch all data in parallel — including both rhythms
  const [profileA, profileB, rifA, rifB, weightsA, feedbackA, rhythmA, rhythmB] = await Promise.all([
        fetchUserProfile(supabase, user_a_id),
        fetchUserProfile(supabase, user_b_id),
        fetchRIFProfile(supabase, user_a_id),
        fetchRIFProfile(supabase, user_b_id),
        fetchMLWeights(supabase, user_a_id),
        fetchCompatibilityFeedback(supabase, user_a_id),
        input.requester_rhythm !== undefined ? Promise.resolve(input.requester_rhythm) : fetchWeeklyRhythm(supabase, user_a_id),
        input.candidate_rhythm !== undefined ? Promise.resolve(input.candidate_rhythm) : fetchWeeklyRhythm(supabase, user_b_id),
      ])

  // 2. Deterministic feature vector
  const features = buildFeatureVector(profileA, profileB, rifA, rifB, feedbackA, weightsA)

  // 3. Rhythm alignment bonus (+0.10 to weighted_score when both chose same rhythm)
  const rhythmAligned = rhythmA !== null && rhythmB !== null && rhythmA === rhythmB
    const rhythmBoost = rhythmAligned ? 0.10 : 0
    const adjustedScore = Math.min(1, features.weighted_score + rhythmBoost)

  // 4. GPT-4o-mini curation decision
  const aiDecision = await callGPTCurator(
        profileA, profileB, rifA, rifB,
    { ...features, weighted_score: adjustedScore },
        feedbackA,
        rhythmA,
        rhythmB
      )

  const result: CurationResult = {
        should_match: aiDecision.should_match,
        confidence: aiDecision.confidence,
        compatibility_score: Math.round(adjustedScore * 100),
        match_reason: aiDecision.match_reason,
        internal_rationale: aiDecision.internal_rationale,
        rif_breakdown: features.rif_breakdown,
        interest_overlap: features.interest_overlap,
        flags: rhythmAligned
          ? [...aiDecision.flags, 'rhythm_aligned']
                : aiDecision.flags,
        rhythm_aligned: rhythmAligned,
  }

  // 5. Persist curation decision
  await supabase.from('curation_decisions').upsert({
        user_a_id,
        user_b_id,
        requester_id,
        should_match: result.should_match,
        confidence: result.confidence,
        compatibility_score: result.compatibility_score,
        match_reason: result.match_reason,
        internal_rationale: result.internal_rationale,
        rif_breakdown: result.rif_breakdown,
        interest_overlap: result.interest_overlap,
        flags: result.flags,
        model_version: 'gpt-4o-mini-v2-rhythm',
        created_at: new Date().toISOString(),
  })

  // 6. Stamp weekly_rhythm on the curated_matches row for the requester
  if (rhythmA) {
        const weekStart = getCurrentWeekStart()
        await supabase
          .from('curated_matches')
          .update({ weekly_rhythm: rhythmA })
          .eq('user_id', user_a_id)
          .eq('matched_user_id', user_b_id)
          .eq('week_start', weekStart)
  }

  return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// ─────────────────────────────────────────────
// Batch: rank and filter a pool of candidates
// ─────────────────────────────────────────────
async function batchCurate(supabase: any, data: any): Promise<Response> {
    const { requester_id, candidate_ids, top_n = 3 } = data

  if (!requester_id || !candidate_ids?.length) {
        return new Response(
                JSON.stringify({ error: 'requester_id and candidate_ids required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
              )
  }

  // Fetch the requester's rhythm once for the whole batch
  const requesterRhythm = await fetchWeeklyRhythm(supabase, requester_id)

  const scored: Array<{ user_id: string; result: CurationResult }> = []

      for (const candidateId of candidate_ids) {
            try {
                    // Fetch candidate's rhythm too
              const candidateRhythm = await fetchWeeklyRhythm(supabase, candidateId)

              const resp = await curatePair(supabase, {
                        user_a_id: requester_id,
                        user_b_id: candidateId,
                        requester_id,
                        requester_rhythm: requesterRhythm,
                        candidate_rhythm: candidateRhythm,
              })
                    const json = await resp.json()
                    if (json.result?.should_match !== false) {
                              scored.push({ user_id: candidateId, result: json.result })
                    }
            } catch (err) {
                    console.warn('Skipping candidate', candidateId, err)
            }
      }

  // Sort: rhythm-aligned matches float to the top within the same confidence band
  scored.sort((a, b) => {
        const scoreA = b.result.confidence * b.result.compatibility_score + (b.result.rhythm_aligned ? 5 : 0)
        const scoreB = a.result.confidence * a.result.compatibility_score + (a.result.rhythm_aligned ? 5 : 0)
        return scoreA - scoreB
  })

  const picks = scored.slice(0, top_n)

  return new Response(
        JSON.stringify({ success: true, picks, total_evaluated: candidate_ids.length, requester_rhythm: requesterRhythm }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
}

// ─────────────────────────────────────────────
// Feature engineering
// ─────────────────────────────────────────────
function buildFeatureVector(
    profileA: UserProfile | null,
    profileB: UserProfile | null,
    rifA: RIFProfile | null,
    rifB: RIFProfile | null,
    feedbackHistory: CompatibilityFeedback[],
    weights: MLWeights
  ) {
    const rifDimensions = [
          'intent_clarity', 'pacing_preferences', 'emotional_readiness',
          'boundary_respect', 'post_date_alignment',
        ] as const

  const rifBreakdown: Record<string, number> = {}
      let rifScore = 0

  if (rifA && rifB) {
        for (const dim of rifDimensions) {
                const a = (rifA as any)[dim] ?? 5
                const b = (rifB as any)[dim] ?? 5
                const weight = dim === 'boundary_respect' ? 1.5 : dim === 'emotional_readiness' ? 1.3 : 1.0
                const dimScore = (1 - Math.abs(a - b) / 10) * weight
                rifBreakdown[dim] = Math.round(dimScore * 100) / 100
                rifScore += dimScore
        }
        rifScore = rifScore / 5.8
  } else {
        rifScore = 0.5
        for (const dim of rifDimensions) rifBreakdown[dim] = 0.5
  }

  const interestsA = (profileA?.interests ?? []).map((s: string) => s.toLowerCase())
    const interestsB = (profileB?.interests ?? []).map((s: string) => s.toLowerCase())
    const setA = new Set(interestsA)
    const setB = new Set(interestsB)
    const overlap = [...setA].filter(x => setB.has(x))
    const union = new Set([...setA, ...setB])
    const interestScore = union.size > 0 ? overlap.length / union.size : 0

  const behavioralScore = calculateBehavioralScore(profileB, interestsB, feedbackHistory)

  const w = weights ?? { rif_weight: 0.45, interest_weight: 0.30, behavioral_weight: 0.25 }
    const weightedScore = rifScore * w.rif_weight + interestScore * w.interest_weight + behavioralScore * w.behavioral_weight

  return {
        rif_score: rifScore,
        interest_score: interestScore,
        behavioral_score: behavioralScore,
        weighted_score: Math.min(1, weightedScore),
        rif_breakdown: rifBreakdown,
        interest_overlap: overlap,
        raw_weights: w,
  }
}

function calculateBehavioralScore(
    candidate: UserProfile | null,
    candidateInterests: string[],
    feedbackHistory: CompatibilityFeedback[]
  ): number {
    if (!feedbackHistory?.length || !candidate) return 0.5

  const positiveHistory = feedbackHistory.filter(f =>
        f.interaction_type === 'like' ||
        f.interaction_type === 'message' ||
        (f.interaction_type === 'date' && f.feedback_score >= 6)
                                                   )

  if (positiveHistory.length === 0) return 0.5

  const avgPositiveScore = positiveHistory.reduce((s, f) => s + f.feedback_score, 0) / positiveHistory.length
    const recentBias = positiveHistory.slice(0, 10).length / Math.max(positiveHistory.length, 10)
    return Math.min(1, (avgPositiveScore / 10) * (0.7 + 0.3 * recentBias))
}

// ─────────────────────────────────────────────
// GPT-4o-mini curation call
// ─────────────────────────────────────────────
async function callGPTCurator(
    profileA: UserProfile | null,
    profileB: UserProfile | null,
    rifA: RIFProfile | null,
    rifB: RIFProfile | null,
    features: ReturnType<typeof buildFeatureVector>,
    feedbackHistory: CompatibilityFeedback[],
    rhythmA: WeeklyRhythm | null,
    rhythmB: WeeklyRhythm | null
  ): Promise<{
    should_match: boolean
    confidence: number
    match_reason: string
    internal_rationale: string
    flags: string[]
}> {
    const openAIKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIKey) return deterministicFallback(features, rhythmA, rhythmB)

  const rhythmContext = rhythmA && rhythmB
      ? rhythmA === rhythmB
          ? `Both people selected the same weekly rhythm: "${rhythmA}". This is a strong energy-alignment signal — factor it positively.`
          : `Person A chose rhythm "${rhythmA}" and Person B chose "${rhythmB}". Consider whether these rhythms complement or clash.`
        : 'Weekly rhythm data is not yet available for one or both users.'

  const recentFeedbackSummary = summarizeFeedback(feedbackHistory)

  const systemPrompt = `You are the MonArk curation engine — a thoughtful AI that decides whether two people would genuinely benefit from being introduced.
  MonArk's philosophy: quality over quantity. Only 3 curated introductions per Sunday. Every decision must feel considered, not algorithmic.

  Weekly rhythm context: Each user selects a weekly mood (reset = calm/restorative, spark = light/social, stretch = adventurous) that shapes their ideal date energy for that week. Rhythm alignment is a meaningful signal but not a hard requirement.

  Your task:
  1. Decide should_match (true/false)
  2. Estimate confidence (0.0-1.0)
  3. Write a match_reason (1-2 sentences, warm, specific, shown to the user — reference something real about both people)
  4. Write internal_rationale (3-5 sentences, honest analysis for audit)
  5. List flags from: high_rif_alignment, pacing_mismatch, boundary_concern, high_interest_overlap, low_data_confidence, behavioral_positive_signal, emotional_readiness_gap, rhythm_aligned, rhythm_complementary

  Rules:
  - match_reason must NEVER be generic. Reference actual interests or RIF qualities.
  - If pacing_preferences differ by > 4 points, flag pacing_mismatch and reduce confidence.
  - If boundary_respect < 5 for either person, flag boundary_concern and set should_match: false.
  - If weighted_score < 0.45, set should_match: false unless there is a strong specific reason.
  - Write match_reason in second person to Person A. E.g. "You both light up around..."
  - Respond ONLY with valid JSON.`

  const userPrompt = `Person A (requester):
  Name: ${profileA?.display_name ?? 'Unknown'}
  Bio: ${(profileA?.bio ?? '').substring(0, 200)}
  Interests: ${(profileA?.interests ?? []).slice(0, 10).join(', ')}
  RIF: intent_clarity=${rifA?.intent_clarity ?? '?'}, pacing=${rifA?.pacing_preferences ?? '?'}, emotional_readiness=${rifA?.emotional_readiness ?? '?'}, boundary_respect=${rifA?.boundary_respect ?? '?'}, post_date_alignment=${rifA?.post_date_alignment ?? '?'}

  Person B (candidate):
  Name: ${profileB?.display_name ?? 'Unknown'}
  Bio: ${(profileB?.bio ?? '').substring(0, 200)}
  Interests: ${(profileB?.interests ?? []).slice(0, 10).join(', ')}
  RIF: intent_clarity=${rifB?.intent_clarity ?? '?'}, pacing=${rifB?.pacing_preferences ?? '?'}, emotional_readiness=${rifB?.emotional_readiness ?? '?'}, boundary_respect=${rifB?.boundary_respect ?? '?'}, post_date_alignment=${rifB?.post_date_alignment ?? '?'}

  Computed features:
  rif_compatibility: ${Math.round(features.rif_score * 100)}%
  interest_overlap: ${features.interest_overlap.join(', ') || 'none detected'}
  behavioral_score: ${Math.round(features.behavioral_score * 100)}%
  weighted_score (with rhythm boost if applicable): ${Math.round(features.weighted_score * 100)}%

  Weekly Rhythm:
  ${rhythmContext}

  Person A's engagement history: ${recentFeedbackSummary}

  Respond in this exact JSON shape:
  {
    "should_match": true,
      "confidence": 0.82,
        "match_reason": "...",
          "internal_rationale": "...",
            "flags": ["high_rif_alignment"]
            }`

  try {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                          'Authorization': `Bearer ${openAIKey}`,
                          'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                          model: 'gpt-4o-mini',
                          messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt },
                                    ],
                          temperature: 0.4,
                          max_tokens: 400,
                          response_format: { type: 'json_object' },
                }),
        })

      if (!resp.ok) {
              console.error('OpenAI error', resp.status)
              return deterministicFallback(features, rhythmA, rhythmB)
      }

      const json = await resp.json()
        const content = json.choices?.[0]?.message?.content
        if (!content) return deterministicFallback(features, rhythmA, rhythmB)

      const parsed = JSON.parse(content)
        return {
                should_match: Boolean(parsed.should_match),
                confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5)),
                match_reason: String(parsed.match_reason || ''),
                internal_rationale: String(parsed.internal_rationale || ''),
                flags: Array.isArray(parsed.flags) ? parsed.flags : [],
        }
  } catch (err) {
        console.error('GPT curator parse error:', err)
        return deterministicFallback(features, rhythmA, rhythmB)
  }
}

function deterministicFallback(
    features: ReturnType<typeof buildFeatureVector>,
    rhythmA: WeeklyRhythm | null,
    rhythmB: WeeklyRhythm | null
  ) {
    const score = features.weighted_score
    const overlap = features.interest_overlap
    const topShared = overlap.slice(0, 2).join(' and ')
    const rhythmAligned = rhythmA !== null && rhythmB !== null && rhythmA === rhythmB

  return {
        should_match: score >= 0.50,
        confidence: score,
        match_reason: overlap.length > 0
          ? `You both share a love of ${topShared}, and your relational pacing scores are closely aligned.`
                : `Your relational readiness profiles complement each other in meaningful ways.`,
        internal_rationale: `Deterministic fallback (no OpenAI key). Weighted score: ${Math.round(score * 100)}%. RIF: ${Math.round(features.rif_score * 100)}%, Interests: ${Math.round(features.interest_score * 100)}%, Behavioral: ${Math.round(features.behavioral_score * 100)}%. Rhythm aligned: ${rhythmAligned}.`,
        flags: [
                ...(score > 0.75 ? ['high_rif_alignment'] : []),
                ...(score < 0.45 ? ['low_data_confidence'] : []),
                ...(rhythmAligned ? ['rhythm_aligned'] : []),
              ],
  }
}

function summarizeFeedback(history: CompatibilityFeedback[]): string {
    if (!history?.length) return 'No engagement history yet (cold start).'
    const likes = history.filter(f => f.interaction_type === 'like').length
    const passes = history.filter(f => f.interaction_type === 'pass').length
    const dates = history.filter(f => f.interaction_type === 'date').length
    const avgScore = history.reduce((s, f) => s + f.feedback_score, 0) / history.length
    return `${history.length} interactions: ${likes} likes, ${passes} passes, ${dates} dates. Average feedback score: ${avgScore.toFixed(1)}/10.`
}

// ─────────────────────────────────────────────
// Data fetchers
// ─────────────────────────────────────────────
async function fetchUserProfile(supabase: any, userId: string): Promise<UserProfile | null> {
    const { data } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, bio, interests, age, city, neighborhood, photos, lifestyle, identity')
      .eq('user_id', userId)
      .maybeSingle()
    return data
}

async function fetchRIFProfile(supabase: any, userId: string): Promise<RIFProfile | null> {
    const { data } = await supabase
      .from('rif_profiles')
      .select('user_id, intent_clarity, pacing_preferences, emotional_readiness, boundary_respect, post_date_alignment')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle()
    return data
}

async function fetchMLWeights(supabase: any, userId: string): Promise<MLWeights> {
    const { data } = await supabase
      .from('user_ml_preferences')
      .select('rif_weight, interest_weight, behavioral_weight, interaction_style, confidence_level')
      .eq('user_id', userId)
      .maybeSingle()
    return data ?? {
          rif_weight: 0.45,
          interest_weight: 0.30,
          behavioral_weight: 0.25,
          interaction_style: 'balanced',
          confidence_level: 0.0,
    }
}

async function fetchCompatibilityFeedback(supabase: any, userId: string): Promise<CompatibilityFeedback[]> {
    const { data } = await supabase
      .from('user_compatibility_feedback')
      .select('target_user_id, feedback_score, interaction_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)
    return data ?? []
}
