import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ── Auth: accepts either a valid user JWT (individual) or CRON_SECRET header (scheduled) ──
async function authenticateRequest(req: Request): Promise<{
  mode: 'user' | 'cron';
  userId?: string;
  supabaseService: any;
} | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

  // Check for cron secret first (Supabase scheduled function invocation)
  const cronSecret = req.headers.get('x-cron-secret');
  const expectedSecret = Deno.env.get('CRON_SECRET');
  if (expectedSecret && cronSecret && cronSecret === expectedSecret) {
    return { mode: 'cron', supabaseService };
  }

  // Fall back to user JWT auth
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await supabaseClient.auth.getUser(
    authHeader.replace('Bearer ', '')
  );
  if (error || !user) return null;

  return { mode: 'user', userId: user.id, supabaseService };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { mode, userId, supabaseService } = auth;

    // ── CRON mode: Sunday batch delivery for all active users ──
    if (mode === 'cron') {
      console.log('weekly-scheduler: cron mode — running Sunday batch delivery');

      // Safety check: only run on Sundays (UTC)
      const now = new Date();
      const dayOfWeek = now.getUTCDay(); // 0 = Sunday
      if (dayOfWeek !== 0) {
        console.log('weekly-scheduler: skipping, today is not Sunday (UTC day=' + dayOfWeek + ')');
        return new Response(
          JSON.stringify({ skipped: true, reason: 'Not Sunday', day: dayOfWeek }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const activeUsers = await getActiveUsers(supabaseService);
      console.log('weekly-scheduler: processing ' + activeUsers.length + ' active users');

      const results = [];
      let notifiedCount = 0;

      for (const usr of activeUsers) {
        try {
          const options = await generateWeeklyOptionsForUser(supabaseService, usr.id);
          results.push({ user_id: usr.id, options_generated: options.length });

          // Send "Your Sunday matches are ready" email notification
          const notified = await sendSundayReadyEmail(supabaseService, usr.id);
          if (notified) notifiedCount++;
        } catch (userErr) {
          console.error('Error processing user ' + usr.id + ':', userErr);
          results.push({ user_id: usr.id, error: String(userErr) });
        }
      }

      return new Response(
        JSON.stringify({ success: true, usersProcessed: activeUsers.length, notifiedCount, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── USER mode: individual on-demand generation ──
    let body: any = {};
    try { body = await req.json(); } catch (_) {}
    const { action, user_id } = body;

    // Ensure user can only generate options for themselves
    if (user_id && user_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Cannot generate options for other users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'generate_weekly_options') {
      const options = await generateWeeklyOptionsForUser(supabaseService, userId!);
      return new Response(
        JSON.stringify({ success: true, results: [{ user_id: userId, options }] }),
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

// ── Send "Your Sunday matches are ready" email ────────────────
async function sendSundayReadyEmail(supabaseClient: any, userId: string): Promise<boolean> {
  try {
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (!profile?.email) return false;

    const firstName = profile.name?.split(' ')?.[0] || 'there';

    const { error } = await supabaseClient.functions.invoke('send-notification-email', {
      body: {
        to: profile.email,
        type: 'system',
        title: 'Your Sunday matches just dropped, ' + firstName + ' 💖',
        message: 'MonArk has handpicked 3 curated matches + 10 people from your dating pool — all waiting for you. Open the app now to see who caught our eye for you this week.',
        actionUrl: 'https://monark.app/dashboard'
      }
    });

    if (error) {
      console.error('Error sending Sunday email to ' + userId + ':', error);
      return false;
    }

    console.log('Sunday ready email sent to user ' + userId);
    return true;
  } catch (err) {
    console.error('sendSundayReadyEmail error for ' + userId + ':', err);
    return false;
  }
}

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
  
  const { data: existing } = await supabaseClient
    .from('weekly_options')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart.toISOString())
    .eq('is_expired', false);

  if (existing && existing.length >= 3) {
    console.log('User ' + userId + ' already has 3 options for this week');
    return existing;
  }

  const { data: eqSettings } = await supabaseClient
    .from('weekly_eq_settings')
    .select('*')
    .eq('user_id', userId)
    .gte('expires_at', new Date().toISOString())
    .maybeSingle();

  const { data: profile } = await supabaseClient
    .from('user_profiles')
    .select('location_data, interests, date_preferences')
    .eq('user_id', userId)
    .maybeSingle();

  const venues = await getVenuesForUser(supabaseClient, profile, eqSettings);
  
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
  const { data: venues } = await supabaseClient
    .from('venues')
    .select('*, venue_care_scores (*)')
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
  const timeWindow = generateTimeWindow(eqSettings);
  const eqFitChips = generateEQFitChips(eqSettings);
  const careIndex = venue?.venue_care_scores?.[0]?.overall_score || 0.8;
  const whyThisForYou = generateWhyText(eqSettings, venue, profile);
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
    venue_data: venue ? { id: venue.id, name: venue.name, address: venue.address, lat: venue.lat, lng: venue.lng } : null,
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
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

function generateTimeWindow(eqSettings: any) {
  const durationMinutes = eqSettings?.duration_preference || 90;
  const boundaries = eqSettings?.time_boundaries || { earliest: "10:00", latest: "22:00" };
  const daysAhead = Math.floor(Math.random() * 5) + 3;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + daysAhead);
  const [earliestHour] = boundaries.earliest.split(':').map(Number);
  const [latestHour] = boundaries.latest.split(':').map(Number);
  const hour = earliestHour + Math.floor(Math.random() * (latestHour - earliestHour));
  startDate.setHours(hour, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);
  return { start: startDate.toISOString(), end: endDate.toISOString() };
}

function generateEQFitChips(eqSettings: any): string[] {
  const chips = [];
  if (eqSettings?.conversation_style) chips.push(eqSettings.conversation_style + '-conversation');
  if (eqSettings?.crowd_tolerance) chips.push(eqSettings.crowd_tolerance);
  if (eqSettings?.duration_preference) chips.push(eqSettings.duration_preference + 'min');
  if (eqSettings?.energy_level) chips.push(eqSettings.energy_level + '-energy');
  return chips.slice(0, 4);
}

function generateWhyText(eqSettings: any, venue: any, profile: any): string {
  const reasons = [];
  if (eqSettings?.conversation_style === 'quiet') reasons.push('intimate atmosphere for deep conversation');
  else if (eqSettings?.conversation_style === 'talkative') reasons.push('lively space that energizes discussion');
  if (eqSettings?.duration_preference <= 60) reasons.push('perfect for your preferred shorter meetups');
  if (venue) reasons.push('high care score (' + ((venue.venue_care_scores?.[0]?.overall_score * 100) || 80).toFixed(0) + '%)');
  return reasons.length > 0
    ? 'Picked for you: ' + reasons.join(', ')
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
