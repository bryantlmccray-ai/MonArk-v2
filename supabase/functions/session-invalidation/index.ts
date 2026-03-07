import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, verifyAuth, errorResponse, validationErrorResponse } from '../_shared/security.ts'
import { validateUUID } from '../_shared/security.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authResult = await verifyAuth(req)
    if (authResult.error || !authResult.user) {
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

    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return validationErrorResponse(['Invalid request body'])
    }

    const { targetUserId, reason } = body

    // Validate target user ID
    const uuidError = validateUUID(targetUserId as string, 'targetUserId')
    if (uuidError) return validationErrorResponse([uuidError])

    // Check if caller is admin OR is invalidating their own sessions
    const isSelfInvalidation = authResult.user.id === targetUserId
    if (!isSelfInvalidation) {
      const { data: isAdmin } = await supabaseAdmin.rpc('has_role', {
        _user_id: authResult.user.id,
        _role: 'admin'
      })

      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Admin access required to invalidate other users\' sessions' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Force sign out all sessions for the target user
    const { error: signOutError } = await supabaseAdmin.auth.admin.signOut(
      targetUserId as string,
      'global' // Revoke ALL sessions including refresh tokens
    )

    if (signOutError) {
      console.error('Session invalidation error:', signOutError)
      return errorResponse(signOutError, 'Failed to invalidate sessions')
    }

    // Log the action
    await supabaseAdmin.from('security_audit_log').insert({
      event_type: 'session_invalidation',
      action: isSelfInvalidation ? 'self_invalidation' : 'admin_forced_invalidation',
      user_id: authResult.user.id,
      target_user_id: targetUserId as string,
      success: true,
      metadata: {
        reason: reason || 'Manual session invalidation',
        invalidated_at: new Date().toISOString()
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: `All sessions for user ${targetUserId} have been revoked`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return errorResponse(error, 'Session invalidation failed')
  }
})
