import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    
    if (!googleMapsApiKey) {
      throw new Error('Google Maps API key not configured')
    }

    return new Response(
      JSON.stringify({ apiKey: googleMapsApiKey }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error fetching Google Maps config:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get Google Maps configuration',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})