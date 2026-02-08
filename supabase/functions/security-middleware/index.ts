import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, verifyAuth, errorResponse, validationErrorResponse } from '../_shared/security.ts'
import { validateLength, validateEmail, validateUUID } from '../_shared/security.ts'

// Rate limit configurations per action type
const RATE_LIMITS: Record<string, { maxRequests: number; windowMinutes: number }> = {
  'message_send': { maxRequests: 30, windowMinutes: 5 },
  'profile_update': { maxRequests: 10, windowMinutes: 15 },
  'auth_attempt': { maxRequests: 5, windowMinutes: 15 },
  'match_response': { maxRequests: 20, windowMinutes: 5 },
  'date_proposal': { maxRequests: 10, windowMinutes: 30 },
  'report_user': { maxRequests: 5, windowMinutes: 60 },
  'block_user': { maxRequests: 10, windowMinutes: 60 },
}

const VALID_ACTIONS = new Set(Object.keys(RATE_LIMITS))

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authentication using shared utility
    const authResult = await verifyAuth(req)
    if (authResult.error || !authResult.user || !authResult.supabaseClient) {
      return new Response(
        JSON.stringify({ error: authResult.error || 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const user = authResult.user

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return validationErrorResponse(['Invalid request body'])
    }

    const { action, targetUserId, resourceType, resourceId, metadata } = body

    // Validate action type
    const actionError = validateLength(action as string, 'action', 1, 100)
    if (actionError) {
      return validationErrorResponse([actionError])
    }

    // Validate optional UUIDs
    if (targetUserId) {
      const uuidError = validateUUID(targetUserId as string, 'targetUserId')
      if (uuidError) return validationErrorResponse([uuidError])
    }

    // Validate optional string fields
    if (resourceType) {
      const rtError = validateLength(resourceType as string, 'resourceType', 0, 100)
      if (rtError) return validationErrorResponse([rtError])
    }
    if (resourceId) {
      const riError = validateLength(resourceId as string, 'resourceId', 0, 255)
      if (riError) return validationErrorResponse([riError])
    }

    // Check rate limit
    const rateLimitConfig = RATE_LIMITS[action as string]
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
      const { data: blocks } = await authResult.supabaseClient
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
    try {
      await supabaseAdmin.rpc('log_security_event', {
        p_event_type: 'security_check',
        p_action: action,
        p_target_user_id: targetUserId || null,
        p_resource_type: resourceType || null,
        p_resource_id: resourceId || null,
        p_success: true,
        p_metadata: metadata || {}
      })
    } catch (logError) {
      console.error('Failed to log security event:', logError)
    }

    return new Response(
      JSON.stringify({ 
        allowed: true,
        userId: user.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return errorResponse(error, 'Security check failed')
  }
})
