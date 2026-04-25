import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type WeeklyRhythm = 'reset' | 'spark' | 'stretch'

interface RIFProfile {
  user_id: string
  intent_clarity: number
  pacing_preferences: number
  emotional_readiness: number
  boundary_respect: number
  post_date_alignment: number
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
  geo_lat?: number | null
  geo_lng?: number | null
  search_radius_km?: number
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
  feedback_score: number
  interaction_type: string
  created_at: string
}

interface CurationInput {
  user_a_id: string
  user_b_id: string
  requester_id: string
  requester_rhythm?: WeeklyRhythm | null
  candidate_rhythm?: WeeklyRhythm | null
  discover_mutual?: boolean
}

interface CurationResult {
  should_match: boolean
  confidence: number
  compatibility_score: number
  match_reason: string
  internal_rationale: string
  rif_breakdown: Record<string, number>
  interest_overlap: string[]
  flags: string[]
  rhythm_aligned: boolean
  discover_mutual: boolean
}

function getCurrentWeekStart(): string {
  const now = new Date()
  const day = now.getUTCDay()
  const diff = now.getUTCDate() - day
  const sunday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff, 0, 0, 0, 0))
  return sunday.toISOString().split('T')[0]
}

async function fetchWeeklyRhythm(supabase: any, userId: string): Promise<WeeklyRhythm | null> {
  const weekStart = getCurrentWeekStart()
  const { data } = await supabase
    .from('user_weekly_rhythm').select('rhythm')
    .eq('user_id', userId).eq('week_start', weekStart).maybeSingle()
  return data?.rhythm ?? null
}

// FIX 3: fetch all discover signals for requester in one query
async function fetchDiscoverSignals(supabase: any, userId: string): Promise<{
  interested: Set<string>; skipped: Set<string>
}> {
  const { data } = await supabase
    .from('discover_interests').select('target_user_id, skipped').eq('user_id', userId)
  const interested = new Set<string>()
  const skipped = new Set<string>()
  for (const row of data ?? []) {
    if (row.skipped) skipped.add(row.target_user_id)
    else interested.add(row.target_user_id)
  }
  return { interested, skipped }
}

// FIX 3: check if candidate also expressed interest in requester
async function checkMutualDiscoverInterest(supabase: any, requesterId: string, candidateId: string): Promise<boolean> {
  const { data } = await supabase
    .from('discover_interests').select('skipped')
    .eq('user_id', candidateId).eq('target_user_id', requesterId).eq('skipped', false).maybeSingle()
  return data != null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Authentication required' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401,
    })
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
    const anonClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } })
    const { data: { user }, error: authError } = await anonClient.auth.getUser()
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401,
    })
    const body = await req.json()
    const { action, data } = body
    switch (action) {
      case 'curate_pair': return await curatePair(supabase, data as CurationInput)
      case 'batch_curate': return await batchCurate(supabase, data)
      default: throw new Error('Invalid action: ' + action)
    }
  } catch (err) {
    console.error('ai-match-curator error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    })
  }
})

async function curatePair(supabase: any, input: CurationInput): Promise<Response> {
  const { user_a_id, user_b_id, requester_id } = input
  const [profileA, profileB, rifA, rifB, weightsA, feedbackA, rhythmA, rhythmB] = await Promise.all([
    fetchUserProfile(supabase, user_a_id), fetchUserProfile(supabase, user_b_id),
    fetchRIFProfile(supabase, user_a_id), fetchRIFProfile(supabase, user_b_id),
    fetchMLWeights(supabase, user_a_id), fetchCompatibilityFeedback(supabase, user_a_id),
    input.requester_rhythm !== undefined ? Promise.resolve(input.requester_rhythm) : fetchWeeklyRhythm(supabase, user_a_id),
    input.candidate_rhythm !== undefined ? Promise.resolve(input.candidate_rhythm) : fetchWeeklyRhythm(supabase, user_b_id),
  ])
  const features = buildFeatureVector(profileA, profileB, rifA, rifB, feedbackA, weightsA)
  const rhythmAligned = rhythmA !== null && rhythmB !== null && rhythmA === rhythmB
  const rhythmBoost = rhythmAligned ? 0.10 : 0
  // FIX 3: use pre-computed discover_mutual or look it up
  const discoverMutual = input.discover_mutual !== undefined
    ? input.discover_mutual
    : await checkMutualDiscoverInterest(supabase, user_a_id, user_b_id)
  const discoverBoost = discoverMutual ? 0.15 : 0
  const adjustedScore = Math.min(1, features.weighted_score + rhythmBoost + discoverBoost)
  const aiDecision = await callGPTCurator(profileA, profileB, rifA, rifB,
    { ...features, weighted_score: adjustedScore }, feedbackA, rhythmA, rhythmB, discoverMutual)
  const flags: string[] = [
    ...(rhythmAligned ? ['rhythm_aligned'] : []),
    ...(discoverMutual ? ['discover_mutual_interest'] : []),
    ...aiDecision.flags,
  ]
  const result: CurationResult = {
    should_match: aiDecision.should_match, confidence: aiDecision.confidence,
    compatibility_score: Math.round(adjustedScore * 100), match_reason: aiDecision.match_reason,
    internal_rationale: aiDecision.internal_rationale, rif_breakdown: features.rif_breakdown,
    interest_overlap: features.interest_overlap, flags, rhythm_aligned: rhythmAligned, discover_mutual: discoverMutual,
  }
  await supabase.from('curation_decisions').upsert({
    user_a_id, user_b_id, requester_id, should_match: result.should_match,
    confidence: result.confidence, compatibility_score: result.compatibility_score,
    match_reason: result.match_reason, internal_rationale: result.internal_rationale,
    rif_breakdown: result.rif_breakdown, interest_overlap: result.interest_overlap,
    flags: result.flags, model_version: 'gpt-4o-mini-v3-geo-discover', created_at: new Date().toISOString(),
  })
  if (rhythmA) {
    const weekStart = getCurrentWeekStart()
    await supabase.from('curated_matches').update({ weekly_rhythm: rhythmA })
      .eq('user_id', user_a_id).eq('matched_user_id', user_b_id).eq('week_start', weekStart)
  }
  return new Response(JSON.stringify({ success: true, result }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// FIX 3: batch_curate now pre-fetches discover signals, pre-filters skipped candidates,
// computes mutual interest in bulk, and sorts with discover_mutual > rhythm_aligned
async function batchCurate(supabase: any, data: any): Promise<Response> {
  const { requester_id, candidate_ids, top_n = 3 } = data
  if (!requester_id || !candidate_ids?.length) {
    return new Response(JSON.stringify({ error: 'requester_id and candidate_ids required' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
  const [requesterRhythm, discoverSignals] = await Promise.all([
    fetchWeeklyRhythm(supabase, requester_id),
    fetchDiscoverSignals(supabase, requester_id),
  ])
  // Pre-filter: skip candidates the requester explicitly skipped
  const eligibleCandidateIds: string[] = candidate_ids.filter((id: string) => !discoverSignals.skipped.has(id))
  if (eligibleCandidateIds.length === 0) {
    return new Response(JSON.stringify({ success: true, picks: [], total_evaluated: 0, requester_rhythm: requesterRhythm }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
  // Bulk fetch: which candidates expressed interest in the requester
  const { data: candidateInterestRows } = await supabase
    .from('discover_interests').select('user_id')
    .in('user_id', eligibleCandidateIds).eq('target_user_id', requester_id).eq('skipped', false)
  const candidatesWhoLikedRequester = new Set<string>((candidateInterestRows ?? []).map((r: any) => r.user_id))
  const scored: Array<{ user_id: string; result: CurationResult }> = []
  for (const candidateId of eligibleCandidateIds) {
    try {
      const candidateRhythm = await fetchWeeklyRhythm(supabase, candidateId)
      const discoverMutual = discoverSignals.interested.has(candidateId) && candidatesWhoLikedRequester.has(candidateId)
      const resp = await curatePair(supabase, {
        user_a_id: requester_id, user_b_id: candidateId, requester_id,
        requester_rhythm: requesterRhythm, candidate_rhythm: candidateRhythm, discover_mutual: discoverMutual,
      })
      const json = await resp.json()
      if (json.result?.should_match !== false) scored.push({ user_id: candidateId, result: json.result })
    } catch (err) { console.warn('Skipping candidate', candidateId, err) }
  }
  // Sort: discover_mutual (+20) > rhythm_aligned (+5) > confidence*score
  scored.sort((a, b) => {
    const sa = b.result.confidence * b.result.compatibility_score + (b.result.discover_mutual ? 20 : 0) + (b.result.rhythm_aligned ? 5 : 0)
    const sb = a.result.confidence * a.result.compatibility_score + (a.result.discover_mutual ? 20 : 0) + (a.result.rhythm_aligned ? 5 : 0)
    return sa - sb
  })
  const picks = scored.slice(0, top_n)
  return new Response(JSON.stringify({
    success: true, picks, total_evaluated: eligibleCandidateIds.length,
    skipped_from_discover: candidate_ids.length - eligibleCandidateIds.length,
    requester_rhythm: requesterRhythm,
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

function buildFeatureVector(profileA: UserProfile | null, profileB: UserProfile | null,
  rifA: RIFProfile | null, rifB: RIFProfile | null,
  feedbackHistory: CompatibilityFeedback[], weights: MLWeights) {
  const rifDimensions = ['intent_clarity','pacing_preferences','emotional_readiness','boundary_respect','post_date_alignment'] as const
  const rifBreakdown: Record<string, number> = {}
  let rifScore = 0
  if (rifA && rifB) {
    for (const dim of rifDimensions) {
      const a = (rifA as any)[dim] ?? 5; const b = (rifB as any)[dim] ?? 5
      const weight = dim === 'boundary_respect' ? 1.5 : dim === 'emotional_readiness' ? 1.3 : 1.0
      const dimScore = (1 - Math.abs(a - b) / 10) * weight
      rifBreakdown[dim] = Math.round(dimScore * 100) / 100; rifScore += dimScore
    }
    rifScore = rifScore / 5.8
  } else { rifScore = 0.5; for (const dim of rifDimensions) rifBreakdown[dim] = 0.5 }
  const interestsA = (profileA?.interests ?? []).map((s: string) => s.toLowerCase())
  const interestsB = (profileB?.interests ?? []).map((s: string) => s.toLowerCase())
  const setA = new Set(interestsA); const setB = new Set(interestsB)
  const overlap = [...setA].filter(x => setB.has(x))
  const union = new Set([...setA, ...setB])
  const interestScore = union.size > 0 ? overlap.length / union.size : 0
  const behavioralScore = calculateBehavioralScore(profileB, interestsB, feedbackHistory)
  const w = weights ?? { rif_weight: 0.45, interest_weight: 0.30, behavioral_weight: 0.25 }
  const weightedScore = rifScore * w.rif_weight + interestScore * w.interest_weight + behavioralScore * w.behavioral_weight
  return { rif_score: rifScore, interest_score: interestScore, behavioral_score: behavioralScore,
    weighted_score: Math.min(1, weightedScore), rif_breakdown: rifBreakdown, interest_overlap: overlap, raw_weights: w }
}

function calculateBehavioralScore(candidate: UserProfile | null, candidateInterests: string[], feedbackHistory: CompatibilityFeedback[]): number {
  if (!feedbackHistory?.length || !candidate) return 0.5
  const positiveHistory = feedbackHistory.filter(f =>
    f.interaction_type === 'like' || f.interaction_type === 'message' || (f.interaction_type === 'date' && f.feedback_score >= 6))
  if (positiveHistory.length === 0) return 0.5
  const avgPositiveScore = positiveHistory.reduce((s, f) => s + f.feedback_score, 0) / positiveHistory.length
  const recentBias = positiveHistory.slice(0, 10).length / Math.max(positiveHistory.length, 10)
  return Math.min(1, (avgPositiveScore / 10) * (0.7 + 0.3 * recentBias))
}

async function callGPTCurator(profileA: UserProfile | null, profileB: UserProfile | null,
  rifA: RIFProfile | null, rifB: RIFProfile | null, features: any,
  feedbackHistory: CompatibilityFeedback[], rhythmA: WeeklyRhythm | null,
  rhythmB: WeeklyRhythm | null, discoverMutual: boolean): Promise<any> {
  const openAIKey = Deno.env.get('OPENAI_API_KEY')
  if (!openAIKey) return deterministicFallback(features, rhythmA, rhythmB, discoverMutual)
  const rhythmContext = rhythmA && rhythmB ? (rhythmA === rhythmB
    ? `Both chose rhythm "${rhythmA}" — strong energy-alignment signal.`
    : `A chose "${rhythmA}", B chose "${rhythmB}" — consider if these complement or clash.`)
    : 'Weekly rhythm data unavailable for one or both users.'
  const discoverContext = discoverMutual
    ? 'IMPORTANT: Both independently expressed interest in each other in Discover Mode — weight heavily.'
    : 'No mutual Discover Mode interest detected.'
  const systemPrompt = `You are the MonArk curation engine. Quality over quantity. Only 3 curated introductions per Sunday.
Weekly rhythm (reset=calm, spark=social, stretch=adventurous) and Discover mutual interest are key signals.
Rules: match_reason must reference real interests/RIF. pacing_preferences diff >4 → pacing_mismatch flag. boundary_respect <5 → set should_match false. weighted_score <0.45 → should_match false UNLESS discover_mutual. If discover_mutual, approve down to 0.38.
Write match_reason in second person to Person A. Respond ONLY valid JSON with: should_match, confidence, match_reason, internal_rationale, flags.`
  const userPrompt = `A: ${profileA?.display_name}, bio: ${(profileA?.bio??'').slice(0,150)}, interests: ${(profileA?.interests??[]).slice(0,8).join(', ')}, RIF: ic=${rifA?.intent_clarity??'?'} pp=${rifA?.pacing_preferences??'?'} er=${rifA?.emotional_readiness??'?'} br=${rifA?.boundary_respect??'?'} pda=${rifA?.post_date_alignment??'?'}
B: ${profileB?.display_name}, bio: ${(profileB?.bio??'').slice(0,150)}, interests: ${(profileB?.interests??[]).slice(0,8).join(', ')}, RIF: ic=${rifB?.intent_clarity??'?'} pp=${rifB?.pacing_preferences??'?'} er=${rifB?.emotional_readiness??'?'} br=${rifB?.boundary_respect??'?'} pda=${rifB?.post_date_alignment??'?'}
rif=${Math.round(features.rif_score*100)}% interest_overlap=${features.interest_overlap.join(',')||'none'} behavioral=${Math.round(features.behavioral_score*100)}% weighted=${Math.round(features.weighted_score*100)}%
Rhythm: ${rhythmContext}
Discover: ${discoverContext}`
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${openAIKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        temperature: 0.4, max_tokens: 400, response_format: { type: 'json_object' } }),
    })
    if (!resp.ok) return deterministicFallback(features, rhythmA, rhythmB, discoverMutual)
    const json = await resp.json()
    const content = json.choices?.[0]?.message?.content
    if (!content) return deterministicFallback(features, rhythmA, rhythmB, discoverMutual)
    const parsed = JSON.parse(content)
    return { should_match: Boolean(parsed.should_match), confidence: Math.min(1, Math.max(0, Number(parsed.confidence)||0.5)),
      match_reason: String(parsed.match_reason||''), internal_rationale: String(parsed.internal_rationale||''),
      flags: Array.isArray(parsed.flags) ? parsed.flags : [] }
  } catch (err) { console.error('GPT curator parse error:', err); return deterministicFallback(features, rhythmA, rhythmB, discoverMutual) }
}

function deterministicFallback(features: any, rhythmA: WeeklyRhythm | null, rhythmB: WeeklyRhythm | null, discoverMutual: boolean) {
  const score = features.weighted_score; const overlap = features.interest_overlap
  const rhythmAligned = rhythmA !== null && rhythmB !== null && rhythmA === rhythmB
  const threshold = discoverMutual ? 0.38 : 0.50
  return {
    should_match: score >= threshold, confidence: score,
    match_reason: overlap.length > 0 ? `You both share a love of ${overlap.slice(0,2).join(' and ')}, and your relational pacing scores are closely aligned.`
      : discoverMutual ? 'You both independently expressed interest in each other — that mutual recognition is worth exploring.'
      : 'Your relational readiness profiles complement each other in meaningful ways.',
    internal_rationale: `Deterministic fallback. Score: ${Math.round(score*100)}%. RIF: ${Math.round(features.rif_score*100)}%, Interest: ${Math.round(features.interest_score*100)}%, Behavioral: ${Math.round(features.behavioral_score*100)}%. Rhythm aligned: ${rhythmAligned}. Discover mutual: ${discoverMutual}.`,
    flags: [...(score>0.75?['high_rif_alignment']:[]),...(score<0.45?['low_data_confidence']:[]),...(rhythmAligned?['rhythm_aligned']:[]),...(discoverMutual?['discover_mutual_interest']:[])],
  }
}

function summarizeFeedback(history: CompatibilityFeedback[]): string {
  if (!history?.length) return 'No engagement history yet.'
  const likes = history.filter(f=>f.interaction_type==='like').length
  const passes = history.filter(f=>f.interaction_type==='pass').length
  const dates = history.filter(f=>f.interaction_type==='date').length
  const avg = history.reduce((s,f)=>s+f.feedback_score,0)/history.length
  return `${history.length} interactions: ${likes} likes, ${passes} passes, ${dates} dates. Avg: ${avg.toFixed(1)}/10.`
}

async function fetchUserProfile(supabase: any, userId: string): Promise<UserProfile | null> {
  const { data } = await supabase.from('user_profiles')
    .select('user_id, display_name, bio, interests, age, city, neighborhood, photos, lifestyle, identity, geo_lat, geo_lng, search_radius_km')
    .eq('user_id', userId).maybeSingle()
  return data
}
async function fetchRIFProfile(supabase: any, userId: string): Promise<RIFProfile | null> {
  const { data } = await supabase.from('rif_profiles')
    .select('user_id, intent_clarity, pacing_preferences, emotional_readiness, boundary_respect, post_date_alignment')
    .eq('user_id', userId).eq('is_active', true).maybeSingle()
  return data
}
async function fetchMLWeights(supabase: any, userId: string): Promise<MLWeights> {
  const { data } = await supabase.from('user_ml_preferences')
    .select('rif_weight, interest_weight, behavioral_weight, interaction_style, confidence_level')
    .eq('user_id', userId).maybeSingle()
  return data ?? { rif_weight: 0.45, interest_weight: 0.30, behavioral_weight: 0.25, interaction_style: 'balanced', confidence_level: 0.0 }
}
async function fetchCompatibilityFeedback(supabase: any, userId: string): Promise<CompatibilityFeedback[]> {
  const { data } = await supabase.from('user_compatibility_feedback')
    .select('target_user_id, feedback_score, interaction_type, created_at')
    .eq('user_id', userId).order('created_at', { ascending: false }).limit(100)
  return data ?? []
}
