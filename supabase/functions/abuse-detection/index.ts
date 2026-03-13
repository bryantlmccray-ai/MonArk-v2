import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, verifyAuth, errorResponse, requireAAL2 } from '../_shared/security.ts'

// Thresholds for flagging abusive users
const THRESHOLDS = {
  reports_to_flag: 3,          // 3+ reports within window
  blocks_to_flag: 5,           // 5+ blocks within window
  rate_limit_violations: 10,   // 10+ rate limit hits
  window_days: 30,             // look-back window
}

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

    // Verify caller is admin
    const { data: isAdmin } = await supabaseAdmin.rpc('has_role', {
      _user_id: authResult.user.id,
      _role: 'admin'
    })

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const windowStart = new Date()
    windowStart.setDate(windowStart.getDate() - THRESHOLDS.window_days)
    const windowISO = windowStart.toISOString()

    // 1. Find users with multiple blocks against them
    const { data: blockedUsers } = await supabaseAdmin
      .from('blocked_users')
      .select('blocked_user_id')
      .gte('created_at', windowISO)

    const blockCounts: Record<string, number> = {}
    blockedUsers?.forEach(b => {
      blockCounts[b.blocked_user_id] = (blockCounts[b.blocked_user_id] || 0) + 1
    })

    // 2. Find users with excessive rate limit violations
    const { data: rateLimitViolations } = await supabaseAdmin
      .from('security_audit_log')
      .select('user_id')
      .eq('event_type', 'rate_limit_exceeded')
      .gte('created_at', windowISO)

    const rateLimitCounts: Record<string, number> = {}
    rateLimitViolations?.forEach(r => {
      if (r.user_id) {
        rateLimitCounts[r.user_id] = (rateLimitCounts[r.user_id] || 0) + 1
      }
    })

    // 3. Build flagged users list
    const flaggedUsers: Array<{
      user_id: string
      reasons: string[]
      block_count: number
      rate_limit_count: number
      severity: 'low' | 'medium' | 'high' | 'critical'
    }> = []

    const allSuspectIds = new Set([
      ...Object.keys(blockCounts),
      ...Object.keys(rateLimitCounts),
    ])

    for (const userId of allSuspectIds) {
      const blocks = blockCounts[userId] || 0
      const rateLimits = rateLimitCounts[userId] || 0
      const reasons: string[] = []

      if (blocks >= THRESHOLDS.blocks_to_flag) reasons.push(`${blocks} blocks received`)
      if (rateLimits >= THRESHOLDS.rate_limit_violations) reasons.push(`${rateLimits} rate limit violations`)

      if (reasons.length > 0) {
        const severity = blocks >= THRESHOLDS.blocks_to_flag * 2 || rateLimits >= THRESHOLDS.rate_limit_violations * 2
          ? 'critical'
          : blocks >= THRESHOLDS.blocks_to_flag || rateLimits >= THRESHOLDS.rate_limit_violations
            ? 'high'
            : reasons.length > 1 ? 'medium' : 'low'

        flaggedUsers.push({
          user_id: userId,
          reasons,
          block_count: blocks,
          rate_limit_count: rateLimits,
          severity,
        })
      }
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    flaggedUsers.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    // Log the scan
    await supabaseAdmin.from('security_audit_log').insert({
      event_type: 'abuse_detection_scan',
      action: 'automated_scan',
      user_id: authResult.user.id,
      success: true,
      metadata: {
        flagged_count: flaggedUsers.length,
        window_days: THRESHOLDS.window_days,
        scanned_at: new Date().toISOString()
      }
    })

    return new Response(
      JSON.stringify({
        flaggedUsers,
        summary: {
          total_flagged: flaggedUsers.length,
          critical: flaggedUsers.filter(u => u.severity === 'critical').length,
          high: flaggedUsers.filter(u => u.severity === 'high').length,
          window_days: THRESHOLDS.window_days,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return errorResponse(error, 'Abuse detection scan failed')
  }
})
