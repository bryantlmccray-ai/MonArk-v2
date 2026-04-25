import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAAL2 } from '../_shared/security.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAAL2 } from '../_shared/security.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Safe columns to select from user_profiles (never expose phone, dob, email, exact location_data)
// geo_lat / geo_lng included so we can run radius pre-filtering in JS when RPC isn't available.
const SAFE_PROFILE_COLUMNS = 'user_id, bio, age, location, interests, photos, occupation, education_level, gender_identity, sexual_orientation, relationship_goals, is_profile_complete, age_verified, geo_lat, geo_lng, search_radius_km';

/**
 * Verify the caller is an authenticated admin user.
  * Returns { user, supabaseAdmin, error }
   */
async function verifyAdminAuth(req: Request) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
          return { user: null, supabaseAdmin: null, error: 'Authentication required' };
    }
  
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } }
    });
  
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
          console.error('Auth verification failed:', authError?.message);
          return { user: null, supabaseAdmin: null, error: 'Invalid or expired authentication' };
    }
  
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
  
    if (roleError || !roleData || roleData.role !== 'admin') {
          await supabaseAdmin.from('security_audit_log').insert({
                  event_type: 'unauthorized_admin_access',
                  user_id: user.id,
                  action: 'match-delivery',
                  success: false,
                  metadata: { attempted_role: roleData?.role || 'none' }
          });
          console.error(`Unauthorized: user ${user.id} attempted admin action (role: ${roleData?.role || 'none'})`);
          return { user: null, supabaseAdmin: null, error: 'Admin access required' };
    }
  
    return { user, supabaseAdmin, error: null };
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
          return new Response(null, { headers: corsHeaders });
    }
  
    try {
          const { user, supabaseAdmin, error: authError } = await verifyAdminAuth(req);
          if (authError || !user || !supabaseAdmin) {
                  return new Response(
                            JSON.stringify({ error: authError || 'Unauthorized' }),
                    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                          );
          }
      
          const mfaResponse = requireAAL2(req);
          if (mfaResponse) return mfaResponse;
      
          let body: Record<string, unknown>;
          try {
                  body = await req.json();
          } catch {
                  return new Response(
                            JSON.stringify({ error: 'Invalid request body' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                          );
          }
      
          const { action, user_id, target_user_id, match_reason, curation_notes, compatibility_score } = body as any;
      
          if (!action || typeof action !== 'string') {
                  return new Response(
                            JSON.stringify({ error: 'Action is required' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                          );
          }
      
          console.log(`Admin ${user.id} executing match-delivery action: ${action}`);
          await supabaseAdmin.from('security_audit_log').insert({
                  event_type: 'admin_action',
                  user_id: user.id,
                  action: `match-delivery:${action}`,
                  success: true,
                  metadata: { user_id, target_user_id }
          });
      
          switch (action) {
            case 'deliver_all_matches':
                      return await deliverAllMatches(supabaseAdmin);
            case 'add_curated_match':
                      if (!user_id || !target_user_id) {
                                  return new Response(
                                                JSON.stringify({ error: 'user_id and target_user_id are required' }),
                                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                                              );
                      }
                      const __rhythm = await fetchWeeklyRhythm(supabaseAdmin, user_id);
                      return await addCuratedMatch(supabaseAdmin, user_id, target_user_id, match_reason, curation_notes, compatibility_score, __rhythm);
            case 'remove_curated_match':
                      if (!user_id || !target_user_id) {
                                  return new Response(
                                                JSON.stringify({ error: 'user_id and target_user_id are required' }),
                                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                                              );
                      }
                      return await removeCuratedMatch(supabaseAdmin, user_id, target_user_id);
            case 'generate_pool':
                      if (!user_id) {
                                  return new Response(
                                                JSON.stringify({ error: 'user_id is required' }),
                                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                                              );
                      }
                      return await generateDatingPool(supabaseAdmin, user_id);
            case 'get_curation_queue':
                      return await getCurationQueue(supabaseAdmin);
            case 'get_user_matches':
                      if (!user_id) {
                                  return new Response(
                                                JSON.stringify({ error: 'user_id is required' }),
                                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                                              );
                      }
                      return await getUserMatches(supabaseAdmin, user_id);
            case 'get_potential_matches':
                      if (!user_id) {
                                  return new Response(
                                                JSON.stringify({ error: 'user_id is required' }),
                                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                                              );
                      }
                      return await getPotentialMatches(supabaseAdmin, user_id);
            default:
                      return new Response(
                                  JSON.stringify({ error: 'Unknown action' }),
                        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                                );
          }
    } catch (error) {
          console.error('Error in match-delivery:', error);
          return new Response(
                  JSON.stringify({ error: 'An internal error occurred' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
    }
});

// Deliver all pending curated matches and dating pools
async function deliverAllMatches(supabase: any) {
    const weekStart = getCurrentWeekStart();
    console.log(`Delivering matches for week: ${weekStart}`);
  
    const { data: pendingMatches, error: matchError } = await supabase
      .from('curated_matches')
      .select('user_id')
      .eq('week_start', weekStart)
      .eq('is_delivered', false)
      .eq('status', 'pending');
  
    if (matchError) throw matchError;
  
    const userIds = [...new Set(pendingMatches?.map((m: any) => m.user_id) || [])];
    console.log(`Found ${userIds.length} users with pending matches`);
  
    const results = [];
    for (const userId of userIds) {
          try {
                  const { data: curated, error: curatedError } = await supabase
                    .from('curated_matches')
                    .update({ is_delivered: true, delivered_at: new Date().toISOString() })
                    .eq('user_id', userId)
                    .eq('week_start', weekStart)
                    .eq('is_delivered', false)
                    .select();
            
                  if (curatedError) throw curatedError;
            
                  const { count: poolCount } = await supabase
                    .from('dating_pool')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .eq('week_start', weekStart);
            
                  await supabase.from('match_delivery_log').insert({
                            user_id: userId,
                            week_start: weekStart,
                            curated_count: curated?.length || 0,
                            pool_count: poolCount || 0,
                            delivery_method: 'scheduled'
                  });
            
                  await supabase
                    .from('curation_queue')
                    .update({ needs_curation: false, last_curated_at: new Date().toISOString() })
                    .eq('user_id', userId);
            
                  results.push({ userId, curated: curated?.length || 0, pool: poolCount || 0 });
                  console.log(`Delivered to user ${userId}: ${curated?.length} curated, ${poolCount} pool`);
          } catch (err) {
                  console.error(`Failed to deliver for user ${userId}:`, err);
                  results.push({ userId, error: 'delivery failed' });
          }
    }
  
    return new Response(
          JSON.stringify({ success: true, delivered: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
}

// Admin adds a curated match
async function addCuratedMatch(
    supabase: any,
    userId: string,
    targetUserId: string,
    matchReason: string,
    curationNotes: string,
    compatibilityScore: number,
    weeklyRhythm?: string | null
  ) {
    const weekStart = getCurrentWeekStart();
  
    const { data: existing } = await supabase
      .from('curated_matches')
      .select('id')
      .eq('user_id', userId)
      .eq('matched_user_id', targetUserId)
      .eq('week_start', weekStart)
      .maybeSingle();
  
    if (existing) {
          return new Response(
                  JSON.stringify({ error: 'Match already exists for this week' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
    }
  
    const { count } = await supabase
      .from('curated_matches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('week_start', weekStart);
  
    if ((count || 0) >= 3) {
          return new Response(
                  JSON.stringify({ error: 'User already has 3 curated matches for this week' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
    }
  
    const { data, error } = await supabase
      .from('curated_matches')
      .insert({
              user_id: userId,
              matched_user_id: targetUserId,
              week_start: weekStart,
              match_reason: matchReason,
              curation_notes: curationNotes,
              compatibility_score: compatibilityScore,
              status: 'pending',
              is_delivered: false,
              ...(weeklyRhythm ? { weekly_rhythm: weeklyRhythm } : {})
      })
      .select()
      .single();
  
    if (error) throw error;
  
    console.log(`Added curated match: ${userId} -> ${targetUserId}`);
    return new Response(
          JSON.stringify({ success: true, match: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
}

// Admin removes a curated match
async function removeCuratedMatch(supabase: any, userId: string, targetUserId: string) {
    const weekStart = getCurrentWeekStart();
  
    const { error } = await supabase
      .from('curated_matches')
      .delete()
      .eq('user_id', userId)
      .eq('matched_user_id', targetUserId)
      .eq('week_start', weekStart)
      .eq('is_delivered', false);
  
    if (error) throw error;
  
    console.log(`Removed curated match: ${userId} -> ${targetUserId}`);
    return new Response(
          JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 1 (geo pre-filter) + FIX 2 (rhythm bug):
//   generateDatingPool now:
//   a) Uses get_candidates_within_radius RPC for real ST_DWithin geo filtering.
//   b) Falls back to city-string matching when user has no geo_lat/geo_lng yet.
//   c) Fetches rhythm from user_weekly_rhythm (not user_profiles) per candidate.
// ─────────────────────────────────────────────────────────────────────────────
async function generateDatingPool(supabase: any, userId: string) {
    const weekStart = getCurrentWeekStart();
  
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select(`${SAFE_PROFILE_COLUMNS}, city`)
      .eq('user_id', userId)
      .single();
  
    if (!userProfile) {
          return new Response(
                  JSON.stringify({ error: 'User profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
    }
  
    // Collect IDs to exclude from candidate pool
    const { data: curatedMatches } = await supabase
      .from('curated_matches')
      .select('matched_user_id')
      .eq('user_id', userId)
      .eq('week_start', weekStart);
  
    const { data: blockedRows } = await supabase
      .from('blocked_users')
      .select('blocker_user_id, blocked_user_id')
      .or(`blocker_user_id.eq.${userId},blocked_user_id.eq.${userId}`);
  
    const blockedIds = (blockedRows || []).map((b: any) =>
          b.blocker_user_id === userId ? b.blocked_user_id : b.blocker_user_id
        );
  
    const excludeIds: string[] = [
          userId,
          ...(curatedMatches?.map((m: any) => m.matched_user_id) || []),
          ...blockedIds,
        ];
  
    // ── FIX 1: Geo-aware candidate fetch ──────────────────────────────────────
    let candidates: any[] = [];
    const userLat = userProfile.geo_lat;
    const userLng = userProfile.geo_lng;
    const radiusKm = userProfile.search_radius_km ?? 50;
    let geoFiltered = false;
  
    if (userLat != null && userLng != null) {
          // Use the PostGIS RPC for real radius matching
          const { data: geoRows, error: geoErr } = await supabase.rpc(
                  'get_candidates_within_radius',
            {
                      center_lat: userLat,
                      center_lng: userLng,
                      radius_km: radiusKm,
                      exclude_ids: excludeIds,
            }
                );
      
          if (!geoErr && geoRows && geoRows.length > 0) {
                  const candidateIds: string[] = geoRows.map((r: any) => r.user_id);
                  const distanceMap: Record<string, number> = Object.fromEntries(
                            geoRows.map((r: any) => [r.user_id, r.distance_km])
                          );
            
                  // Fetch full profile data for those candidates
                  const { data: profileRows } = await supabase
                    .from('user_profiles')
                    .select('user_id, age, location, interests, gender_identity, sexual_orientation, relationship_goals')
                    .in('user_id', candidateIds);
            
                  candidates = (profileRows || []).map((p: any) => ({
                            ...p,
                            distance_km: distanceMap[p.user_id] ?? 999,
                  }));
                  geoFiltered = true;
                  console.log(`Geo-filtered pool for ${userId}: ${candidates.length} candidates within ${radiusKm}km`);
          } else {
                  console.warn(`Geo RPC returned no results for ${userId}, falling back to city-string match`);
          }
    }
  
    // Fallback: city-string matching when no geo coordinates available
    if (!geoFiltered || candidates.length < 5) {
          console.log(`Falling back to city-string candidate fetch for user ${userId} (geoFiltered=${geoFiltered}, count=${candidates.length})`);
          const existingIds = new Set(candidates.map((c: any) => c.user_id));
          const { data: fallbackRows } = await supabase
            .from('user_profiles')
            .select('user_id, age, location, interests, gender_identity, sexual_orientation, relationship_goals')
            .eq('is_profile_complete', true)
            .eq('age_verified', true)
            .not('user_id', 'in', `(${excludeIds.join(',')})`)
            .limit(50);
      
          const newCandidates = (fallbackRows || []).filter((c: any) => !existingIds.has(c.user_id));
          candidates = [...candidates, ...newCandidates];
    }
  
    // ── FIX 2: Fetch user's rhythm from user_weekly_rhythm (not user_profiles) ─
    const userRhythm = await fetchWeeklyRhythm(supabase, userId);
  
    // Fetch all candidate rhythms in one query (not N+1)
    const candidateIds = candidates.map((c: any) => c.user_id);
    const weekStartStr = weekStart;
    let candidateRhythmMap: Record<string, string> = {};
  
    if (candidateIds.length > 0) {
          const { data: rhythmRows } = await supabase
            .from('user_weekly_rhythm')
            .select('user_id, rhythm')
            .in('user_id', candidateIds)
            .eq('week_start', weekStartStr);
      
          candidateRhythmMap = Object.fromEntries(
                  (rhythmRows || []).map((r: any) => [r.user_id, r.rhythm])
                );
    }
  
    // Score candidates — now with correctly sourced rhythm
    const scored = candidates.map((candidate: any) => {
          const base = calculateCompatibility(userProfile, candidate);
      
          // FIX 2: read rhythm from the map we fetched, NOT from user_profiles columns
          const candidateRhythm = candidateRhythmMap[candidate.user_id] ?? null;
          const rhythmBonus =
                  userRhythm && candidateRhythm && userRhythm === candidateRhythm ? 0.10 : 0;
      
          // Small bonus for closer candidates when geo data is available
          const distanceBonus =
                  candidate.distance_km != null
              ? Math.max(0, 0.05 * (1 - candidate.distance_km / Math.max(radiusKm, 1)))
                    : 0;
      
          return {
                  ...candidate,
                  score: Math.min(base + rhythmBonus + distanceBonus, 1),
                  rhythm_aligned: rhythmBonus > 0,
          };
    });
  
    scored.sort((a: any, b: any) => b.score - a.score);
    const top10 = scored.slice(0, 10);
  
    // Persist pool
    await supabase
      .from('dating_pool')
      .delete()
      .eq('user_id', userId)
      .eq('week_start', weekStart);
  
    if (top10.length > 0) {
          const poolEntries = top10.map((candidate: any) => ({
                  user_id: userId,
                  pool_user_id: candidate.user_id,
                  week_start: weekStart,
                  compatibility_score: candidate.score,
                  status: 'pending',
          }));
      
          const { error: insertError } = await supabase
            .from('dating_pool')
            .insert(poolEntries);
      
          if (insertError) throw insertError;
    }
  
    console.log(`Generated dating pool for ${userId}: ${top10.length} candidates (geo=${geoFiltered}, rhythm=${userRhythm})`);
    return new Response(
          JSON.stringify({ success: true, pool_size: top10.length, geo_filtered: geoFiltered }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
}

// Get curation queue for admins (only safe fields)
async function getCurationQueue(supabase: any) {
    const { data, error } = await supabase
      .from('curation_queue')
      .select(`
            *,
                  user_profile:user_profiles!user_id (
                          bio, age, location, interests, photos, gender_identity
                                ),
                                      profile:profiles!user_id (
                                              name
                                                    )
                                                        `)
      .eq('needs_curation', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(50);
  
    if (error) throw error;
  
    return new Response(
          JSON.stringify({ success: true, queue: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
}

// Get curated matches for a user (admin view - safe fields only)
async function getUserMatches(supabase: any, userId: string) {
    const weekStart = getCurrentWeekStart();
  
    const { data: curated, error: curatedError } = await supabase
      .from('curated_matches')
      .select(`
            *,
                  matched_profile:user_profiles!matched_user_id (
                          bio, age, location, interests, photos, occupation, education_level
                                ),
                                      matched_name:profiles!matched_user_id (
                                              name
                                                    )
                                                        `)
      .eq('user_id', userId)
      .eq('week_start', weekStart);
  
    if (curatedError) throw curatedError;
  
    const { data: pool, error: poolError } = await supabase
      .from('dating_pool')
      .select(`
            *,
                  pool_profile:user_profiles!pool_user_id (
                          bio, age, location, interests, photos, occupation, education_level
                                ),
                                      pool_name:profiles!pool_user_id (
                                              name
                                                    )
                                                        `)
      .eq('user_id', userId)
      .eq('week_start', weekStart);
  
    if (poolError) throw poolError;
  
    return new Response(
          JSON.stringify({ success: true, curated, pool }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
}

// Get potential matches for admin to choose from (safe fields only)
async function getPotentialMatches(supabase: any, userId: string) {
    const weekStart = getCurrentWeekStart();
  
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select(SAFE_PROFILE_COLUMNS)
      .eq('user_id', userId)
      .single();
  
    if (!userProfile) {
          return new Response(
                  JSON.stringify({ error: 'User profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
    }
  
    const { data: existingMatches } = await supabase
      .from('curated_matches')
      .select('matched_user_id')
      .eq('user_id', userId)
      .eq('week_start', weekStart);
  
    const { data: blockedRows } = await supabase
      .from('blocked_users')
      .select('blocker_user_id, blocked_user_id')
      .or(`blocker_user_id.eq.${userId},blocked_user_id.eq.${userId}`);
  
    const blockedIds = (blockedRows || []).map((b: any) =>
          b.blocker_user_id === userId ? b.blocked_user_id : b.blocker_user_id
        );
  
    const excludeIds = [userId, ...(existingMatches?.map((m: any) => m.matched_user_id) || []), ...blockedIds];
  
    // Use geo RPC if available, otherwise fallback
    let candidates: any[] = [];
    const userLat = userProfile.geo_lat;
    const userLng = userProfile.geo_lng;
    const radiusKm = userProfile.search_radius_km ?? 50;
  
    if (userLat != null && userLng != null) {
          const { data: geoRows } = await supabase.rpc('get_candidates_within_radius', {
                  center_lat: userLat,
                  center_lng: userLng,
                  radius_km: radiusKm,
                  exclude_ids: excludeIds,
          });
          if (geoRows?.length) {
                  const ids = geoRows.map((r: any) => r.user_id);
                  const { data: profileRows } = await supabase
                    .from('user_profiles')
                    .select('user_id, bio, age, location, interests, photos, occupation, education_level, gender_identity, sexual_orientation')
                    .in('user_id', ids);
                  candidates = profileRows || [];
          }
    }
  
    if (candidates.length < 5) {
          const { data: fallback, error } = await supabase
            .from('user_profiles')
            .select('user_id, bio, age, location, interests, photos, occupation, education_level, gender_identity, sexual_orientation')
            .eq('is_profile_complete', true)
            .eq('age_verified', true)
            .not('user_id', 'in', `(${excludeIds.join(',')})`)
            .limit(30);
          if (error) throw error;
          const existing = new Set(candidates.map((c: any) => c.user_id));
          candidates = [...candidates, ...(fallback || []).filter((c: any) => !existing.has(c.user_id))];
    }
  
    const userIds = candidates.map((c: any) => c.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', userIds);
  
    const enriched = candidates.map((candidate: any) => {
          const profile = profiles?.find((p: any) => p.id === candidate.user_id);
          return {
                  ...candidate,
                  name: profile?.name,
                  compatibility_score: calculateCompatibility(userProfile, candidate)
          };
    });
  
    enriched.sort((a: any, b: any) => b.compatibility_score - a.compatibility_score);
  
    return new Response(
          JSON.stringify({ success: true, candidates: enriched }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
}

// Helper: Calculate compatibility score (interest + location string fallback + age + goals)
function calculateCompatibility(user1: any, user2: any): number {
    let score = 0.5;
  
    // Interest overlap (up to +0.2)
    const interests1 = user1.interests || [];
    const interests2 = user2.interests || [];
    const commonInterests = interests1.filter((i: string) => interests2.includes(i));
    score += Math.min(commonInterests.length * 0.05, 0.2);
  
    // Location string fallback (up to +0.1) — only used when geo columns unavailable
    if (user1.location && user2.location) {
          const loc1 = user1.location.toLowerCase();
          const loc2 = user2.location.toLowerCase();
          if (loc1.includes(loc2.split(',')[0]) || loc2.includes(loc1.split(',')[0])) {
                  score += 0.1;
          }
    }
  
    // Age proximity (up to +0.15)
    if (user1.age && user2.age) {
          const ageDiff = Math.abs(user1.age - user2.age);
          if (ageDiff <= 3) score += 0.15;
          else if (ageDiff <= 5) score += 0.1;
          else if (ageDiff <= 10) score += 0.05;
    }
  
    // Relationship goals alignment (up to +0.1)
    const goals1 = user1.relationship_goals || [];
    const goals2 = user2.relationship_goals || [];
    if (goals1.length > 0 && goals2.length > 0) {
          const commonGoals = goals1.filter((g: string) => goals2.includes(g));
          score += Math.min(commonGoals.length * 0.05, 0.1);
    }
  
    return Math.min(score, 1);
}

// Helper: Get current week start (Sunday at midnight UTC)
function getCurrentWeekStart(): string {
    const now = new Date();
    const day = now.getUTCDay(); // 0 = Sunday
    const diff = now.getUTCDate() - day;
    const sunday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff, 0, 0, 0, 0));
    return sunday.toISOString().split('T')[0];
}

/**
 * FIX 2: Fetch user's rhythm selection from user_weekly_rhythm table.
  * Returns null if not set this week.
   */
async function fetchWeeklyRhythm(supabase: any, userId: string): Promise<string | null> {
    const weekStart = getCurrentWeekStart();
    const { data } = await supabase
      .from('user_weekly_rhythm')
      .select('rhythm')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .maybeSingle();
    return data?.rhythm ?? null;
}
// Safe columns to select from user_profiles (never expose phone, dob, email, exact location_data)
const SAFE_PROFILE_COLUMNS = 'user_id, bio, age, location, interests, photos, occupation, education_level, gender_identity, sexual_orientation, relationship_goals, is_profile_complete, age_verified';

/**
 * Verify the caller is an authenticated admin user.
 * Returns { user, supabaseAdmin, error }
 */
async function verifyAdminAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { user: null, supabaseAdmin: null, error: 'Authentication required' };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  // Create a user-scoped client to verify the JWT
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    console.error('Auth verification failed:', authError?.message);
    return { user: null, supabaseAdmin: null, error: 'Invalid or expired authentication' };
  }

  // Check admin role using service role client
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const { data: roleData, error: roleError } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleError || !roleData || roleData.role !== 'admin') {
    // Log unauthorized access attempt
    await supabaseAdmin.from('security_audit_log').insert({
      event_type: 'unauthorized_admin_access',
      user_id: user.id,
      action: 'match-delivery',
      success: false,
      metadata: { attempted_role: roleData?.role || 'none' }
    });
    console.error(`Unauthorized: user ${user.id} attempted admin action (role: ${roleData?.role || 'none'})`);
    return { user: null, supabaseAdmin: null, error: 'Admin access required' };
  }

  return { user, supabaseAdmin, error: null };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ALL actions require admin authentication
    const { user, supabaseAdmin, error: authError } = await verifyAdminAuth(req);
    if (authError || !user || !supabaseAdmin) {
      return new Response(
        JSON.stringify({ error: authError || 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Require MFA (aal2) for admin operations
    const mfaResponse = requireAAL2(req);
    if (mfaResponse) return mfaResponse;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, user_id, target_user_id, match_reason, curation_notes, compatibility_score } = body as any;

    if (!action || typeof action !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log every admin action
    console.log(`Admin ${user.id} executing match-delivery action: ${action}`);
    await supabaseAdmin.from('security_audit_log').insert({
      event_type: 'admin_action',
      user_id: user.id,
      action: `match-delivery:${action}`,
      success: true,
      metadata: { user_id, target_user_id }
    });

    switch (action) {
      case 'deliver_all_matches':
        return await deliverAllMatches(supabaseAdmin);
      
      case 'add_curated_match':
        if (!user_id || !target_user_id) {
          return new Response(
            JSON.stringify({ error: 'user_id and target_user_id are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const __rhythm = await fetchWeeklyRhythm(supabaseAdmin, user_id);
        return await addCuratedMatch(supabaseAdmin, user_id, target_user_id, match_reason, curation_notes, compatibility_score, __rhythm);
      
      case 'remove_curated_match':
        if (!user_id || !target_user_id) {
          return new Response(
            JSON.stringify({ error: 'user_id and target_user_id are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return await removeCuratedMatch(supabaseAdmin, user_id, target_user_id);
      
      case 'generate_pool':
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: 'user_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return await generateDatingPool(supabaseAdmin, user_id);
      
      case 'get_curation_queue':
        return await getCurationQueue(supabaseAdmin);
      
      case 'get_user_matches':
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: 'user_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return await getUserMatches(supabaseAdmin, user_id);
      
      case 'get_potential_matches':
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: 'user_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return await getPotentialMatches(supabaseAdmin, user_id);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in match-delivery:', error);
    return new Response(
      JSON.stringify({ error: 'An internal error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Deliver all pending curated matches and dating pools
async function deliverAllMatches(supabase: any) {
  const weekStart = getCurrentWeekStart();
  console.log(`Delivering matches for week: ${weekStart}`);

  const { data: pendingMatches, error: matchError } = await supabase
    .from('curated_matches')
    .select('user_id')
    .eq('week_start', weekStart)
    .eq('is_delivered', false)
    .eq('status', 'pending');

  if (matchError) throw matchError;

  const userIds = [...new Set(pendingMatches?.map((m: any) => m.user_id) || [])];
  console.log(`Found ${userIds.length} users with pending matches`);

  const results = [];
  for (const userId of userIds) {
    try {
      const { data: curated, error: curatedError } = await supabase
        .from('curated_matches')
        .update({ 
          is_delivered: true, 
          delivered_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('week_start', weekStart)
        .eq('is_delivered', false)
        .select();

      if (curatedError) throw curatedError;

      const { count: poolCount } = await supabase
        .from('dating_pool')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('week_start', weekStart);

      await supabase.from('match_delivery_log').insert({
        user_id: userId,
        week_start: weekStart,
        curated_count: curated?.length || 0,
        pool_count: poolCount || 0,
        delivery_method: 'scheduled'
      });

      await supabase
        .from('curation_queue')
        .update({ 
          needs_curation: false,
          last_curated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      results.push({ userId, curated: curated?.length || 0, pool: poolCount || 0 });
      console.log(`Delivered to user ${userId}: ${curated?.length} curated, ${poolCount} pool`);
    } catch (err) {
      console.error(`Failed to deliver for user ${userId}:`, err);
      results.push({ userId, error: 'delivery failed' });
    }
  }

  return new Response(
    JSON.stringify({ success: true, delivered: results.length, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Admin adds a curated match
async function addCuratedMatch(
  supabase: any, 
  userId: string, 
  targetUserId: string, 
  matchReason: string,
  curationNotes: string,
  compatibilityScore: number,
  weeklyRhythm?: string | null
) {
  const weekStart = getCurrentWeekStart();

  const { data: existing } = await supabase
    .from('curated_matches')
    .select('id')
    .eq('user_id', userId)
    .eq('matched_user_id', targetUserId)
    .eq('week_start', weekStart)
    .maybeSingle();

  if (existing) {
    return new Response(
      JSON.stringify({ error: 'Match already exists for this week' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { count } = await supabase
    .from('curated_matches')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('week_start', weekStart);

  if ((count || 0) >= 3) {
    return new Response(
      JSON.stringify({ error: 'User already has 3 curated matches for this week' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data, error } = await supabase
    .from('curated_matches')
    .insert({
      user_id: userId,
      matched_user_id: targetUserId,
      week_start: weekStart,
      match_reason: matchReason,
      curation_notes: curationNotes,
      compatibility_score: compatibilityScore,
      status: 'pending',
      is_delivered: false,
      ...(weeklyRhythm ? { weekly_rhythm: weeklyRhythm } : {})
    })
    .select()
    .single();

  if (error) throw error;

  console.log(`Added curated match: ${userId} -> ${targetUserId}`);

  return new Response(
    JSON.stringify({ success: true, match: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Admin removes a curated match
async function removeCuratedMatch(supabase: any, userId: string, targetUserId: string) {
  const weekStart = getCurrentWeekStart();

  const { error } = await supabase
    .from('curated_matches')
    .delete()
    .eq('user_id', userId)
    .eq('matched_user_id', targetUserId)
    .eq('week_start', weekStart)
    .eq('is_delivered', false);

  if (error) throw error;

  console.log(`Removed curated match: ${userId} -> ${targetUserId}`);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Generate 10-person dating pool for a user
async function generateDatingPool(supabase: any, userId: string) {
  const weekStart = getCurrentWeekStart();

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select(SAFE_PROFILE_COLUMNS)
    .eq('user_id', userId)
    .single();

  if (!userProfile) {
    return new Response(
      JSON.stringify({ error: 'User profile not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data: curatedMatches } = await supabase
    .from('curated_matches')
    .select('matched_user_id')
    .eq('user_id', userId)
    .eq('week_start', weekStart);

  // Also exclude blocked users from candidate pool
  const { data: blockedRows } = await supabase
    .from('blocked_users')
    .select('blocker_user_id, blocked_user_id')
    .or(`blocker_user_id.eq.${userId},blocked_user_id.eq.${userId}`);

  const blockedIds = (blockedRows || []).map((b: any) =>
    b.blocker_user_id === userId ? b.blocked_user_id : b.blocker_user_id
  );

  const excludeIds = [userId, ...(curatedMatches?.map((m: any) => m.matched_user_id) || []), ...blockedIds];

  let { data: candidates, error } = await supabase
    .from('user_profiles')
    .select('user_id, age, location, interests, gender_identity, sexual_orientation, relationship_goals')
    .eq('is_profile_complete', true)
    .eq('age_verified', true)
    .not('user_id', 'in', `(${excludeIds.join(',')})`)
    .limit(50);

  if (error) throw error;

  // Fallback: if candidate pool is too small, relax filters (drop age_verified requirement)
  if (!candidates || candidates.length < 10) {
    console.log(`Small pool (${candidates?.length || 0}), relaxing filters for user ${userId}`);
    const { data: fallbackCandidates, error: fbError } = await supabase
      .from('user_profiles')
      .select('user_id, age, location, interests, gender_identity, sexual_orientation, relationship_goals')
      .eq('is_profile_complete', true)
      .not('user_id', 'in', `(${excludeIds.join(',')})`)
      .limit(50);

    if (!fbError && fallbackCandidates) {
      // Merge without duplicates
      const existingIds = new Set(candidates?.map((c: any) => c.user_id) || []);
      const newCandidates = fallbackCandidates.filter((c: any) => !existingIds.has(c.user_id));
      candidates = [...(candidates || []), ...newCandidates];
    }
  }

  // Fetch user's weekly rhythm to boost same-rhythm candidates
  const userRhythm = await fetchWeeklyRhythm(supabase, userId);

  const scored = (candidates || []).map((candidate: any) => {
    const base = calculateCompatibility(userProfile, candidate);
    // Apply +10% boost when both users share the same rhythm this week
    const rhythmBonus = (userRhythm && candidate.weekly_rhythm === userRhythm) ? 0.10 : 0;
    return {
      ...candidate,
      score: Math.min(base + rhythmBonus, 1)
    };
  });

  scored.sort((a: any, b: any) => b.score - a.score);
  const top10 = scored.slice(0, 10);

  await supabase
    .from('dating_pool')
    .delete()
    .eq('user_id', userId)
    .eq('week_start', weekStart);

  if (top10.length > 0) {
    const poolEntries = top10.map((candidate: any) => ({
      user_id: userId,
      pool_user_id: candidate.user_id,
      week_start: weekStart,
      compatibility_score: candidate.score,
      status: 'pending'
    }));

    const { error: insertError } = await supabase
      .from('dating_pool')
      .insert(poolEntries);

    if (insertError) throw insertError;
  }

  console.log(`Generated dating pool for ${userId}: ${top10.length} candidates`);

  return new Response(
    JSON.stringify({ success: true, pool_size: top10.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Get curation queue for admins (only safe fields)
async function getCurationQueue(supabase: any) {
  const { data, error } = await supabase
    .from('curation_queue')
    .select(`
      *,
      user_profile:user_profiles!user_id (
        bio, age, location, interests, photos, gender_identity
      ),
      profile:profiles!user_id (
        name
      )
    `)
    .eq('needs_curation', true)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(50);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, queue: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Get curated matches for a user (admin view - safe fields only)
async function getUserMatches(supabase: any, userId: string) {
  const weekStart = getCurrentWeekStart();

  const { data: curated, error: curatedError } = await supabase
    .from('curated_matches')
    .select(`
      *,
      matched_profile:user_profiles!matched_user_id (
        bio, age, location, interests, photos, occupation, education_level
      ),
      matched_name:profiles!matched_user_id (
        name
      )
    `)
    .eq('user_id', userId)
    .eq('week_start', weekStart);

  if (curatedError) throw curatedError;

  const { data: pool, error: poolError } = await supabase
    .from('dating_pool')
    .select(`
      *,
      pool_profile:user_profiles!pool_user_id (
        bio, age, location, interests, photos, occupation, education_level
      ),
      pool_name:profiles!pool_user_id (
        name
      )
    `)
    .eq('user_id', userId)
    .eq('week_start', weekStart);

  if (poolError) throw poolError;

  return new Response(
    JSON.stringify({ success: true, curated, pool }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Get potential matches for admin to choose from (safe fields only)
async function getPotentialMatches(supabase: any, userId: string) {
  const weekStart = getCurrentWeekStart();

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select(SAFE_PROFILE_COLUMNS)
    .eq('user_id', userId)
    .single();

  if (!userProfile) {
    return new Response(
      JSON.stringify({ error: 'User profile not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data: existingMatches } = await supabase
    .from('curated_matches')
    .select('matched_user_id')
    .eq('user_id', userId)
    .eq('week_start', weekStart);

  // Exclude blocked users
  const { data: blockedRows } = await supabase
    .from('blocked_users')
    .select('blocker_user_id, blocked_user_id')
    .or(`blocker_user_id.eq.${userId},blocked_user_id.eq.${userId}`);

  const blockedIds = (blockedRows || []).map((b: any) =>
    b.blocker_user_id === userId ? b.blocked_user_id : b.blocker_user_id
  );

  const excludeIds = [userId, ...(existingMatches?.map((m: any) => m.matched_user_id) || []), ...blockedIds];

  const { data: candidates, error } = await supabase
    .from('user_profiles')
    .select('user_id, bio, age, location, interests, photos, occupation, education_level, gender_identity, sexual_orientation')
    .eq('is_profile_complete', true)
    .eq('age_verified', true)
    .not('user_id', 'in', `(${excludeIds.join(',')})`)
    .limit(30);

  if (error) throw error;

  const userIds = candidates?.map((c: any) => c.user_id) || [];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', userIds);

  const enriched = (candidates || []).map((candidate: any) => {
    const profile = profiles?.find((p: any) => p.id === candidate.user_id);
    return {
      ...candidate,
      name: profile?.name,
      compatibility_score: calculateCompatibility(userProfile, candidate)
    };
  });

  enriched.sort((a: any, b: any) => b.compatibility_score - a.compatibility_score);

  return new Response(
    JSON.stringify({ success: true, candidates: enriched }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper: Calculate compatibility score
function calculateCompatibility(user1: any, user2: any): number {
  let score = 0.5;

  // Interest overlap (up to +0.2)
  const interests1 = user1.interests || [];
  const interests2 = user2.interests || [];
  const commonInterests = interests1.filter((i: string) => interests2.includes(i));
  score += Math.min(commonInterests.length * 0.05, 0.2);

  // Location proximity (up to +0.1)
  if (user1.location && user2.location) {
    const loc1 = user1.location.toLowerCase();
    const loc2 = user2.location.toLowerCase();
    if (loc1.includes(loc2.split(',')[0]) || loc2.includes(loc1.split(',')[0])) {
      score += 0.1;
    }
  }

  // Age proximity (up to +0.15)
  if (user1.age && user2.age) {
    const ageDiff = Math.abs(user1.age - user2.age);
    if (ageDiff <= 3) score += 0.15;
    else if (ageDiff <= 5) score += 0.1;
    else if (ageDiff <= 10) score += 0.05;
  }

  // Relationship goals alignment (up to +0.1)
  const goals1 = user1.relationship_goals || [];
  const goals2 = user2.relationship_goals || [];
  if (goals1.length > 0 && goals2.length > 0) {
    const commonGoals = goals1.filter((g: string) => goals2.includes(g));
    score += Math.min(commonGoals.length * 0.05, 0.1);
  }

  return Math.min(score, 1);
}

// Helper: Get current week start (Sunday)
function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  const sunday = new Date(now.setDate(diff));
  sunday.setHours(0, 0, 0, 0);
  return sunday.toISOString().split('T')[0];
}

/** Fetch user's rhythm selection for the current week (null if not set). */
async function fetchWeeklyRhythm(supabase: any, userId: string): Promise<string | null> {
  const weekStart = getCurrentWeekStart();
  const { data } = await supabase
    .from('user_weekly_rhythm')
    .select('rhythm')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle();
  return data?.rhythm ?? null;
}

