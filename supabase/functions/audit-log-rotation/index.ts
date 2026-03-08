import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, errorResponse } from '../_shared/security.ts'

// Retention policies (days)
const RETENTION = {
  security_audit_log: 90,
  rate_limits: 1,
  behavior_analytics: 60,
  rif_event_log: 90,
}

function verifyCronSecret(req: Request): boolean {
  const secret = req.headers.get('x-cron-secret')
  const expected = Deno.env.get('CRON_SECRET')
  return !!secret && !!expected && secret === expected
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Accept either cron secret OR admin JWT
    const isCron = verifyCronSecret(req)

    if (!isCron) {
      // Fall back to JWT + admin check
      const { verifyAuth } = await import('../_shared/security.ts')
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
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    const results: Record<string, { deleted: number; error?: string }> = {}

    // 1. Rotate security_audit_log
    const auditCutoff = new Date()
    auditCutoff.setDate(auditCutoff.getDate() - RETENTION.security_audit_log)
    await supabaseAdmin
      .from('security_audit_log')
      .delete()
      .lt('created_at', auditCutoff.toISOString())
    results.security_audit_log = { deleted: 0 }

    // 2. Clean rate_limits
    const rateCutoff = new Date()
    rateCutoff.setDate(rateCutoff.getDate() - RETENTION.rate_limits)
    await supabaseAdmin
      .from('rate_limits')
      .delete()
      .lt('window_start', rateCutoff.toISOString())
    results.rate_limits = { deleted: 0 }

    // 3. Rotate behavior_analytics
    const analyticsCutoff = new Date()
    analyticsCutoff.setDate(analyticsCutoff.getDate() - RETENTION.behavior_analytics)
    await supabaseAdmin
      .from('behavior_analytics')
      .delete()
      .lt('created_at', analyticsCutoff.toISOString())
    results.behavior_analytics = { deleted: 0 }

    // 4. Rotate rif_event_log
    const rifCutoff = new Date()
    rifCutoff.setDate(rifCutoff.getDate() - RETENTION.rif_event_log)
    await supabaseAdmin
      .from('rif_event_log')
      .delete()
      .lt('timestamp', rifCutoff.toISOString())
    results.rif_event_log = { deleted: 0 }

    // Log the rotation
    await supabaseAdmin.from('security_audit_log').insert({
      event_type: 'audit_log_rotation',
      action: 'scheduled_cleanup',
      success: true,
      metadata: { results, retention_policy: RETENTION, source: isCron ? 'cron' : 'admin', executed_at: new Date().toISOString() }
    })

    return new Response(
      JSON.stringify({
        success: true,
        results,
        retentionPolicy: RETENTION,
        executedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return errorResponse(error, 'Audit log rotation failed')
  }
})
