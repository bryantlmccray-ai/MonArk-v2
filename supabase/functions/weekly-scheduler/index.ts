import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user first
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

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

    // Use service role for operations
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, user_id } = await req.json();

    // Ensure user can only generate options for themselves
    if (user_id && user_id !== user.id) {
      throw new Error('Cannot generate options for other users')
    }

    if (action === 'generate_weekly_options') {
      // Generate options for the authenticated user only
      const usersToProcess = [{ id: user.id }];

      const results = [];
      for (const usr of usersToProcess) {
        const options = await generateWeeklyOptionsForUser(supabaseService, usr.id);
        results.push({ user_id: usr.id, options });
      }

      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in weekly-scheduler:', error);
    return new Response(
      JSON.stringify({ error: 'An internal error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getActiveUsers(supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('user_profiles')
    .select('user_id')
    .eq('is_profile_complete', true)
    .eq('age_verified', true);

  if (error) throw error;
  return data.map((p: any) => ({ id: p.user_id }));
}

async function generateWeeklyOptionsForUser(supabaseClient: any, userId: string) {
  const weekStart = getWeekStart();
  
  // Check if options already exist for this week
  const { data: existing } = await supabaseClient
    .from('weekly_options')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart.toISOString())
    .eq('is_expired', false);

  if (existing && existing.length >= 3) {
    console.log(`User ${userId} already has 3 options for this week`);
    return existing;
  }

  // Get user's EQ settings
  const { data: eqSettings } = await supabaseClient
    .from('weekly_eq_settings')
    .select('*')
    .eq('user_id', userId)
    .gte('expires_at', new Date().toISOString())
    .maybeSingle();

  // Get user profile for location and preferences
  const { data: profile } = await supabaseClient
    .from('user_profiles')
    .select('location_data, interests, date_preferences')
    .eq('user_id', userId)
    .maybeSingle();

  // Get venues within radius
  const venues = await getVenuesForUser(supabaseClient, profile, eqSettings);
  
  // Generate 3 options
  const options = [];
  const optionsNeeded = 3 - (existing?.length || 0);
  
  for (let i = 0; i < optionsNeeded; i++) {
    const option = await generateSingleOption(
      supabaseClient,
      userId,
      weekStart,
      (existing?.length || 0) + i + 1,
      venues,
      eqSettings,
      profile
    );
    options.push(option);
  }

  return options;
}

async function getVenuesForUser(supabaseClient: any, profile: any, eqSettings: any) {
  const radius = eqSettings?.radius_km || 10;
  
  // Get all venues (in production, you'd filter by distance)
  const { data: venues } = await supabaseClient
    .from('venues')
    .select(`
      *,
      venue_care_scores (*)
    `)
    .limit(20);

  return venues || [];
}

async function generateSingleOption(
  supabaseClient: any,
  userId: string,
  weekStart: Date,
  optionNumber: number,
  venues: any[],
  eqSettings: any,
  profile: any
) {
  const venue = venues[Math.floor(Math.random() * Math.min(venues.length, 5))];
  const isTemplate = !venue || venues.length < 3;

  // Generate time window based on EQ settings
  const timeWindow = generateTimeWindow(eqSettings);
  
  // Generate EQ fit chips based on settings
  const eqFitChips = generateEQFitChips(eqSettings);
  
  // Calculate care index
  const careIndex = venue?.venue_care_scores?.[0]?.overall_score || 0.8;

  // Generate personalized "why this for you"
  const whyThisForYou = generateWhyText(eqSettings, venue, profile);

  // Generate vibe line
  const vibeLine = generateVibeLine(eqSettings, venue);

  const optionData = {
    user_id: userId,
    week_start: weekStart.toISOString(),
    option_number: optionNumber,
    title: isTemplate ? generateTemplateTitle(eqSettings) : venue.name,
    vibe_line: vibeLine,
    time_window: timeWindow,
    distance_km: venue ? Math.random() * 5 + 1 : null,
    eq_fit_chips: eqFitChips,
    care_index_score: careIndex,
    why_this_for_you: whyThisForYou,
    venue_data: venue ? {
      id: venue.id,
      name: venue.name,
      address: venue.address,
      lat: venue.lat,
      lng: venue.lng
    } : null,
    is_template: isTemplate
  };

  const { data, error } = await supabaseClient
    .from('weekly_options')
    .insert(optionData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(now.setDate(diff));
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

function generateTimeWindow(eqSettings: any) {
  const durationMinutes = eqSettings?.duration_preference || 90;
  const boundaries = eqSettings?.time_boundaries || { earliest: "10:00", latest: "22:00" };
  
  // Generate a time window for next 3-7 days
  const daysAhead = Math.floor(Math.random() * 5) + 3;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + daysAhead);
  
  // Set time based on boundaries
  const [earliestHour, earliestMinute] = boundaries.earliest.split(':').map(Number);
  const [latestHour, latestMinute] = boundaries.latest.split(':').map(Number);
  
  const hour = earliestHour + Math.floor(Math.random() * (latestHour - earliestHour));
  startDate.setHours(hour, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString()
  };
}

function generateEQFitChips(eqSettings: any): string[] {
  const chips = [];
  
  if (eqSettings?.conversation_style) {
    chips.push(`${eqSettings.conversation_style}-conversation`);
  }
  
  if (eqSettings?.crowd_tolerance) {
    chips.push(eqSettings.crowd_tolerance);
  }
  
  if (eqSettings?.duration_preference) {
    chips.push(`${eqSettings.duration_preference}min`);
  }

  if (eqSettings?.energy_level) {
    chips.push(`${eqSettings.energy_level}-energy`);
  }

  return chips.slice(0, 4);
}

function generateWhyText(eqSettings: any, venue: any, profile: any): string {
  const reasons = [];
  
  if (eqSettings?.conversation_style === 'quiet') {
    reasons.push('intimate atmosphere for deep conversation');
  } else if (eqSettings?.conversation_style === 'talkative') {
    reasons.push('lively space that energizes discussion');
  }
  
  if (eqSettings?.duration_preference <= 60) {
    reasons.push('perfect for your preferred shorter meetups');
  }
  
  if (venue) {
    reasons.push(`high care score (${(venue.venue_care_scores?.[0]?.overall_score * 100 || 80).toFixed(0)}%)`);
  }

  return reasons.length > 0 
    ? `Picked for you: ${reasons.join(', ')}`
    : 'A thoughtfully curated option that matches your preferences';
}

function generateVibeLine(eqSettings: any, venue: any): string {
  const vibes = [
    'Relaxed and conversation-focused',
    'Energizing with great ambiance',
    'Intimate and thoughtfully designed',
    'Welcoming with attentive service',
    'Perfect for meaningful connection'
  ];
  
  return vibes[Math.floor(Math.random() * vibes.length)];
}

function generateTemplateTitle(eqSettings: any): string {
  const templates = [
    'Coffee & Walk in the Park',
    'Quiet Afternoon at Local Café',
    'Gallery Stroll & Discussion',
    'Bookstore Browse & Coffee',
    'Sunset Walk & Conversation'
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}