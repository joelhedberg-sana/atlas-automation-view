import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, data } = await req.json()

    switch (action) {
      case 'check_suspicious_activity':
        return await checkSuspiciousActivity(supabaseClient, data)
      case 'cleanup_expired_sessions':
        return await cleanupExpiredSessions(supabaseClient)
      case 'process_data_retention':
        return await processDataRetention(supabaseClient)
      case 'generate_security_report':
        return await generateSecurityReport(supabaseClient, data)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Security monitor error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function checkSuspiciousActivity(supabase: any, data: any) {
  const { timeWindow = 24 } = data // hours
  
  // Check for suspicious patterns
  const { data: suspiciousEvents, error } = await supabase
    .from('security_events')
    .select('*')
    .gte('created_at', new Date(Date.now() - timeWindow * 60 * 60 * 1000).toISOString())
    .or('attempt_count.gte.5,event_type.eq.account_locked')

  if (error) throw error

  // Group by IP and email to identify patterns
  const ipCounts: Record<string, number> = {}
  const emailCounts: Record<string, number> = {}

  suspiciousEvents.forEach((event: any) => {
    if (event.ip_address) {
      ipCounts[event.ip_address] = (ipCounts[event.ip_address] || 0) + 1
    }
    if (event.email) {
      emailCounts[event.email] = (emailCounts[event.email] || 0) + 1
    }
  })

  const alerts = []

  // Check for IP-based attacks
  Object.entries(ipCounts).forEach(([ip, count]) => {
    if (count >= 10) {
      alerts.push({
        type: 'ip_attack',
        severity: 'high',
        details: { ip, attempts: count },
        message: `Suspicious activity from IP ${ip}: ${count} failed attempts`
      })
    }
  })

  // Check for credential stuffing
  Object.entries(emailCounts).forEach(([email, count]) => {
    if (count >= 5) {
      alerts.push({
        type: 'credential_stuffing',
        severity: 'medium',
        details: { email, attempts: count },
        message: `Multiple failed attempts for ${email}: ${count} attempts`
      })
    }
  })

  return new Response(
    JSON.stringify({ alerts, summary: { total_events: suspiciousEvents.length } }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function cleanupExpiredSessions(supabase: any) {
  // Deactivate expired sessions
  const { data, error } = await supabase
    .from('user_sessions')
    .update({ is_active: false })
    .lt('expires_at', new Date().toISOString())
    .eq('is_active', true)

  if (error) throw error

  // Delete old security events (older than 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  await supabase
    .from('security_events')
    .delete()
    .lt('created_at', ninetyDaysAgo)

  return new Response(
    JSON.stringify({ 
      message: 'Cleanup completed',
      expired_sessions: data?.length || 0
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function processDataRetention(supabase: any) {
  // Get active retention policies
  const { data: policies, error } = await supabase
    .from('data_retention_policies')
    .select('*')
    .eq('is_active', true)

  if (error) throw error

  const results = []

  for (const policy of policies) {
    const cutoffDate = new Date(Date.now() - policy.retention_days * 24 * 60 * 60 * 1000).toISOString()
    
    try {
      const { data, error: deleteError } = await supabase
        .from(policy.table_name)
        .delete()
        .lt('created_at', cutoffDate)

      if (deleteError) {
        console.error(`Error cleaning up ${policy.table_name}:`, deleteError)
        results.push({
          table: policy.table_name,
          status: 'error',
          error: deleteError.message
        })
      } else {
        // Update last cleanup time
        await supabase
          .from('data_retention_policies')
          .update({ last_cleanup: new Date().toISOString() })
          .eq('id', policy.id)

        results.push({
          table: policy.table_name,
          status: 'success',
          deleted_count: data?.length || 0
        })
      }
    } catch (err) {
      results.push({
        table: policy.table_name,
        status: 'error',
        error: err.message
      })
    }
  }

  return new Response(
    JSON.stringify({ results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function generateSecurityReport(supabase: any, data: any) {
  const { startDate, endDate, organizationId } = data

  // Get security metrics for the time period
  const { data: securityEvents } = await supabase
    .from('security_events')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  const { data: activeSessions } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('is_active', true)

  // Calculate metrics
  const totalSecurityEvents = securityEvents?.length || 0
  const failedLogins = securityEvents?.filter(e => e.event_type === 'failed_login').length || 0
  const accountLockouts = securityEvents?.filter(e => e.event_type === 'account_locked').length || 0
  const uniqueIPs = new Set(securityEvents?.map(e => e.ip_address).filter(Boolean)).size
  const totalAuditLogs = auditLogs?.length || 0
  const activeSessionCount = activeSessions?.length || 0

  // Risk assessment
  let riskLevel = 'low'
  if (failedLogins > 50 || accountLockouts > 5) {
    riskLevel = 'high'
  } else if (failedLogins > 20 || accountLockouts > 2) {
    riskLevel = 'medium'
  }

  const report = {
    period: { startDate, endDate },
    summary: {
      totalSecurityEvents,
      failedLogins,
      accountLockouts,
      uniqueIPs,
      totalAuditLogs,
      activeSessionCount,
      riskLevel
    },
    recommendations: generateRecommendations(failedLogins, accountLockouts, uniqueIPs),
    events: securityEvents?.slice(0, 10) || [] // Latest 10 events
  }

  return new Response(
    JSON.stringify(report),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function generateRecommendations(failedLogins: number, accountLockouts: number, uniqueIPs: number) {
  const recommendations = []

  if (failedLogins > 50) {
    recommendations.push({
      priority: 'high',
      type: 'security',
      message: 'High number of failed login attempts detected. Consider implementing additional rate limiting or IP blocking.'
    })
  }

  if (accountLockouts > 5) {
    recommendations.push({
      priority: 'medium',
      type: 'user_experience',
      message: 'Multiple account lockouts detected. Consider reviewing lockout policies or implementing progressive delays.'
    })
  }

  if (uniqueIPs > 100) {
    recommendations.push({
      priority: 'medium',
      type: 'monitoring',
      message: 'Login attempts from many unique IPs. Monitor for potential distributed attacks.'
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'low',
      type: 'maintenance',
      message: 'Security metrics look normal. Continue regular monitoring and maintenance.'
    })
  }

  return recommendations
}