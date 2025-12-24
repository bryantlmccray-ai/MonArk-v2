import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { action, user_id, target_user_id, match_reason, curation_notes, compatibility_score } = await req.json();

    console.log(`Match delivery action: ${action}`);

    switch (action) {
      case 'deliver_all_matches':
        // Called by cron job on Sunday 9am
        return await deliverAllMatches(supabase);
      
      case 'add_curated_match':
        // Admin adds a curated match for a user
        return await addCuratedMatch(supabase, user_id, target_user_id, match_reason, curation_notes, compatibility_score);
      
      case 'remove_curated_match':
        // Admin removes a curated match
        return await removeCuratedMatch(supabase, user_id, target_user_id);
      
      case 'generate_pool':
        // Generate 10-person dating pool for a user
        return await generateDatingPool(supabase, user_id);
      
      case 'get_curation_queue':
        // Get list of users needing curation
        return await getCurationQueue(supabase);
      
      case 'get_user_matches':
        // Get curated matches for a specific user (admin view)
        return await getUserMatches(supabase, user_id);
      
      case 'get_potential_matches':
        // Get potential matches for admin to choose from
        return await getPotentialMatches(supabase, user_id);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in match-delivery:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Deliver all pending curated matches and dating pools
async function deliverAllMatches(supabase: any) {
  const weekStart = getCurrentWeekStart();
  console.log(`Delivering matches for week: ${weekStart}`);

  // Get all users with pending curated matches
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
      // Mark curated matches as delivered
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

      // Get dating pool count
      const { count: poolCount } = await supabase
        .from('dating_pool')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('week_start', weekStart);

      // Log delivery
      await supabase.from('match_delivery_log').insert({
        user_id: userId,
        week_start: weekStart,
        curated_count: curated?.length || 0,
        pool_count: poolCount || 0,
        delivery_method: 'scheduled'
      });

      // Mark user as curated for this week
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
      results.push({ userId, error: err.message });
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
  compatibilityScore: number
) {
  const weekStart = getCurrentWeekStart();

  // Check if match already exists
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

  // Check current curated count (max 3)
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

  // Insert curated match
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
      is_delivered: false
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

  // Get user's profile for matching
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!userProfile) {
    return new Response(
      JSON.stringify({ error: 'User profile not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get already curated matches to exclude
  const { data: curatedMatches } = await supabase
    .from('curated_matches')
    .select('matched_user_id')
    .eq('user_id', userId)
    .eq('week_start', weekStart);

  const excludeIds = [userId, ...(curatedMatches?.map((m: any) => m.matched_user_id) || [])];

  // Get potential pool candidates based on preferences
  const { data: candidates, error } = await supabase
    .from('user_profiles')
    .select('user_id, age, location, interests, gender_identity, sexual_orientation')
    .eq('is_profile_complete', true)
    .eq('age_verified', true)
    .not('user_id', 'in', `(${excludeIds.join(',')})`)
    .limit(50);

  if (error) throw error;

  // Score and select top 10
  const scored = (candidates || []).map((candidate: any) => ({
    ...candidate,
    score: calculateCompatibility(userProfile, candidate)
  }));

  scored.sort((a: any, b: any) => b.score - a.score);
  const top10 = scored.slice(0, 10);

  // Clear existing pool for this week
  await supabase
    .from('dating_pool')
    .delete()
    .eq('user_id', userId)
    .eq('week_start', weekStart);

  // Insert new pool
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

// Get curation queue for admins
async function getCurationQueue(supabase: any) {
  const { data, error } = await supabase
    .from('curation_queue')
    .select(`
      *,
      user_profile:user_profiles!user_id (
        bio, age, location, interests, photos, gender_identity
      ),
      profile:profiles!user_id (
        name, email
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

// Get curated matches for a user (admin view)
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

// Get potential matches for admin to choose from
async function getPotentialMatches(supabase: any, userId: string) {
  const weekStart = getCurrentWeekStart();

  // Get user's profile
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!userProfile) {
    return new Response(
      JSON.stringify({ error: 'User profile not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get already selected matches
  const { data: existingMatches } = await supabase
    .from('curated_matches')
    .select('matched_user_id')
    .eq('user_id', userId)
    .eq('week_start', weekStart);

  const excludeIds = [userId, ...(existingMatches?.map((m: any) => m.matched_user_id) || [])];

  // Get compatible candidates
  const { data: candidates, error } = await supabase
    .from('user_profiles')
    .select(`
      user_id, bio, age, location, interests, photos, 
      occupation, education_level, gender_identity, sexual_orientation
    `)
    .eq('is_profile_complete', true)
    .eq('age_verified', true)
    .not('user_id', 'in', `(${excludeIds.join(',')})`)
    .limit(30);

  if (error) throw error;

  // Get names
  const userIds = candidates?.map((c: any) => c.user_id) || [];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', userIds);

  // Combine with scores
  const enriched = (candidates || []).map((candidate: any) => {
    const profile = profiles?.find((p: any) => p.id === candidate.user_id);
    return {
      ...candidate,
      name: profile?.name,
      compatibility_score: calculateCompatibility(userProfile, candidate)
    };
  });

  // Sort by compatibility
  enriched.sort((a: any, b: any) => b.compatibility_score - a.compatibility_score);

  return new Response(
    JSON.stringify({ success: true, candidates: enriched }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper: Calculate compatibility score
function calculateCompatibility(user1: any, user2: any): number {
  let score = 0.5; // Base score

  // Interest overlap
  const interests1 = user1.interests || [];
  const interests2 = user2.interests || [];
  const commonInterests = interests1.filter((i: string) => interests2.includes(i));
  score += Math.min(commonInterests.length * 0.05, 0.2);

  // Location proximity (simple check)
  if (user1.location && user2.location) {
    const loc1 = user1.location.toLowerCase();
    const loc2 = user2.location.toLowerCase();
    if (loc1.includes(loc2.split(',')[0]) || loc2.includes(loc1.split(',')[0])) {
      score += 0.1;
    }
  }

  // Age range compatibility (prefer within 5 years)
  if (user1.age && user2.age) {
    const ageDiff = Math.abs(user1.age - user2.age);
    if (ageDiff <= 3) score += 0.15;
    else if (ageDiff <= 5) score += 0.1;
    else if (ageDiff <= 10) score += 0.05;
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