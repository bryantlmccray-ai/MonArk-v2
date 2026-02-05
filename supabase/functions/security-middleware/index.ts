import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limit configurations per action type
const RATE_LIMITS: Record<string, { maxRequests: number; windowMinutes: number }> = {
  'message_send': { maxRequests: 30, windowMinutes: 5 },        // 30 messages per 5 minutes
  'profile_update': { maxRequests: 10, windowMinutes: 15 },     // 10 updates per 15 minutes
  'auth_attempt': { maxRequests: 5, windowMinutes: 15 },        // 5 login attempts per 15 minutes
  'match_response': { maxRequests: 20, windowMinutes: 5 },      // 20 match responses per 5 minutes
  'date_proposal': { maxRequests: 10, windowMinutes: 30 },      // 10 proposals per 30 minutes
  'report_user': { maxRequests: 5, windowMinutes: 60 },         // 5 reports per hour
  'block_user': { maxRequests: 10, windowMinutes: 60 },         // 10 blocks per hour
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, targetUserId, resourceType, resourceId, metadata } = await req.json()

    // Validate action type
    if (!action || typeof action !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid action type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check rate limit
    const rateLimitConfig = RATE_LIMITS[action]
    if (rateLimitConfig) {
      const { data: allowed, error: rateLimitError } = await supabaseAdmin.rpc('check_rate_limit', {
        p_user_id: user.id,
        p_action_type: action,
        p_max_requests: rateLimitConfig.maxRequests,
        p_window_minutes: rateLimitConfig.windowMinutes
      })

      if (rateLimitError) {
        console.error('Rate limit check error:', rateLimitError)
      } else if (!allowed) {
        // Log the rate limit violation
        await supabaseAdmin.rpc('log_security_event', {
          p_event_type: 'rate_limit_exceeded',
          p_action: action,
          p_success: false,
          p_metadata: { limit: rateLimitConfig }
        })

        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            retryAfter: rateLimitConfig.windowMinutes * 60
          }),
          { 
            status: 429, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Retry-After': String(rateLimitConfig.windowMinutes * 60)
            } 
          }
        )
      }
    }

    // Check for blocked user relationships
    if (targetUserId) {
      // Check if current user blocked target or vice versa
      const { data: blocks } = await supabaseClient
        .from('blocked_users')
        .select('id')
        .or(`and(blocker_user_id.eq.${user.id},blocked_user_id.eq.${targetUserId}),and(blocker_user_id.eq.${targetUserId},blocked_user_id.eq.${user.id})`)
        .limit(1)

      if (blocks && blocks.length > 0) {
        return new Response(
          JSON.stringify({ error: 'This action is not available' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Log successful security check
    await supabaseAdmin.rpc('log_security_event', {
      p_event_type: 'security_check',
      p_action: action,
      p_target_user_id: targetUserId || null,
      p_resource_type: resourceType || null,
      p_resource_id: resourceId || null,
      p_success: true,
      p_metadata: metadata || {}
    })

    return new Response(
      JSON.stringify({ 
        allowed: true,
        userId: user.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Security middleware error:', error)
    return new Response(
      JSON.stringify({ error: 'Security check failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})