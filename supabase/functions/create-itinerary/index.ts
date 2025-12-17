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
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { weekly_option_id } = await req.json();

    // Get the weekly option
    const { data: option, error: optionError } = await supabaseClient
      .from('weekly_options')
      .select('*')
      .eq('id', weekly_option_id)
      .single();

    if (optionError || !option) {
      throw new Error('Option not found');
    }

    // Mark option as tapped
    await supabaseClient
      .from('weekly_options')
      .update({ tapped_at: new Date().toISOString() })
      .eq('id', weekly_option_id);

    // Generate simple share link
    const shareId = crypto.randomUUID().slice(0, 8);
    const shareLink = `https://monark.app/date/${shareId}`;

    // Create simple itinerary - just venue, time, share link
    const itineraryData = {
      user_id: user.id,
      weekly_option_id,
      mode: 'matched',
      title: option.title,
      description: option.vibe_line,
      time_window: option.time_window,
      location_data: option.venue_data || { 
        name: 'Venue TBD',
        address: 'Location to be confirmed' 
      },
      status: 'confirmed',
      safety_sharing_enabled: true,
      sos_visible: true,
      consent_nudge_shown: true,
      share_link: shareLink
    };

    const { data: itinerary, error: itineraryError } = await supabaseClient
      .from('itineraries')
      .insert(itineraryData)
      .select()
      .single();

    if (itineraryError) {
      console.error('Itinerary insert error:', itineraryError);
      throw itineraryError;
    }

    // Log analytics
    await supabaseClient
      .from('behavior_analytics')
      .insert({
        user_id: user.id,
        event_type: 'itinerary_created',
        event_data: {
          itinerary_id: itinerary.id,
          from_weekly_option: true
        }
      });

    console.log('Itinerary created successfully:', itinerary.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        itinerary,
        share_link: shareLink 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-itinerary:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
