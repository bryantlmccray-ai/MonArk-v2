import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, errorResponse } from '../_shared/security.ts'

// Anomaly thresholds
const THRESHOLDS = {
  max_refreshes_per_hour: 20,
  max_refreshes_per_day: 100,
  max_distinct_ips_per_day: 10,
  window_hours: 24,
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
    const isCron = verifyCronSecret(req)

    if (!isCron) {
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

    const windowStart = new Date()
    windowStart.setHours(windowStart.getHours() - THRESHOLDS.window_hours)

    const { data: authEvents } = await supabaseAdmin
      .from('security_audit_log')
      .select('user_id, ip_address, created_at, event_type, metadata')
      .in('event_type', ['token_refresh', 'auth_attempt', 'session_created'])
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(1000)

    // Aggregate per user
    const userActivity: Record<string, {
      event_count: number
      distinct_ips: Set<string>
      events_by_hour: Record<string, number>
      latest_event: string
    }> = {}

    authEvents?.forEach(event => {
      if (!event.user_id) return
      if (!userActivity[event.user_id]) {
        userActivity[event.user_id] = {
          event_count: 0,
          distinct_ips: new Set(),
          events_by_hour: {},
          latest_event: event.created_at,
        }
      }
      const ua = userActivity[event.user_id]
      ua.event_count++
      if (event.ip_address) ua.distinct_ips.add(event.ip_address)
      const hour = event.created_at.substring(0, 13)
      ua.events_by_hour[hour] = (ua.events_by_hour[hour] || 0) + 1
    })

    // Detect anomalies
    const anomalies: Array<{
      user_id: string
      reasons: string[]
      event_count: number
      distinct_ip_count: number
      max_hourly_rate: number
      risk_level: 'medium' | 'high' | 'critical'
    }> = []

    for (const [userId, activity] of Object.entries(userActivity)) {
      const reasons: string[] = []
      const maxHourly = Math.max(...Object.values(activity.events_by_hour))
      const ipCount = activity.distinct_ips.size

      if (maxHourly > THRESHOLDS.max_refreshes_per_hour) {
        reasons.push(`${maxHourly} auth events in a single hour (limit: ${THRESHOLDS.max_refreshes_per_hour})`)
      }
      if (activity.event_count > THRESHOLDS.max_refreshes_per_day) {
        reasons.push(`${activity.event_count} total auth events in ${THRESHOLDS.window_hours}h (limit: ${THRESHOLDS.max_refreshes_per_day})`)
      }
      if (ipCount > THRESHOLDS.max_distinct_ips_per_day) {
        reasons.push(`${ipCount} distinct IPs (possible token theft)`)
      }

      if (reasons.length > 0) {
        const risk = ipCount > THRESHOLDS.max_distinct_ips_per_day
          ? 'critical'
          : maxHourly > THRESHOLDS.max_refreshes_per_hour * 2
            ? 'high'
            : 'medium'

        anomalies.push({
          user_id: userId,
          reasons,
          event_count: activity.event_count,
          distinct_ip_count: ipCount,
          max_hourly_rate: maxHourly,
          risk_level: risk,
        })
      }
    }

    anomalies.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2 }
      return order[a.risk_level] - order[b.risk_level]
    })

    return new Response(
      JSON.stringify({
        anomalies,
        summary: {
          total_anomalies: anomalies.length,
          critical: anomalies.filter(a => a.risk_level === 'critical').length,
          high: anomalies.filter(a => a.risk_level === 'high').length,
          total_events_analyzed: authEvents?.length || 0,
          window_hours: THRESHOLDS.window_hours,
        },
        thresholds: THRESHOLDS,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return errorResponse(error, 'Token refresh monitoring failed')
  }
})
