import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SecurityEvent {
  id: string;
  user_id?: string | null;
  email?: string | null;
  event_type: string;
  ip_address?: unknown;
  user_agent?: string | null;
  attempt_count: number;
  locked_until?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  event_type: string;
  event_details: any;
  ip_address?: unknown;
  user_agent?: string | null;
  session_id?: string | null;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: unknown;
  user_agent?: string | null;
  expires_at: string;
  last_activity: string;
  is_active: boolean;
  created_at: string;
}

export interface GDPRRequest {
  id: string;
  user_id?: string | null;
  email: string;
  request_type: string;
  status: string;
  requested_data: any;
  processed_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export function useSecurity() {
  const { user } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [gdprRequests, setGDPRRequests] = useState<GDPRRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Audit logging function
  const logSecurityEvent = async (eventType: string, eventDetails: any = {}) => {
    if (!user) return;

    try {
      // Get client info
      const ipAddress = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => null);

      const userAgent = navigator.userAgent;

      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          event_type: eventType,
          event_details: eventDetails,
          ip_address: ipAddress,
          user_agent: userAgent,
          session_id: crypto.randomUUID()
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  // Track failed login attempts
  const trackFailedLogin = async (email: string, error: string) => {
    try {
      const ipAddress = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => null);

      const userAgent = navigator.userAgent;

      // Check if there's an existing security event for this email/IP
      const { data: existingEvent } = await supabase
        .from('security_events')
        .select('*')
        .eq('email', email)
        .eq('ip_address', ipAddress)
        .eq('event_type', 'failed_login')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .maybeSingle();

      if (existingEvent) {
        // Update existing event
        const newAttemptCount = existingEvent.attempt_count + 1;
        const shouldLock = newAttemptCount >= 5;

        await supabase
          .from('security_events')
          .update({
            attempt_count: newAttemptCount,
            locked_until: shouldLock ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null // 30 min lockout
          })
          .eq('id', existingEvent.id);
      } else {
        // Create new security event
        await supabase
          .from('security_events')
          .insert({
            email,
            event_type: 'failed_login',
            ip_address: ipAddress,
            user_agent: userAgent,
            attempt_count: 1
          });
      }
    } catch (error) {
      console.error('Failed to track failed login:', error);
    }
  };

  // Check if account is locked
  const checkAccountLock = async (email: string): Promise<boolean> => {
    try {
      const ipAddress = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => null);

      const { data: securityEvent } = await supabase
        .from('security_events')
        .select('*')
        .eq('email', email)
        .eq('ip_address', ipAddress)
        .eq('event_type', 'failed_login')
        .gte('locked_until', new Date().toISOString())
        .maybeSingle();

      return !!securityEvent;
    } catch (error) {
      console.error('Failed to check account lock:', error);
      return false;
    }
  };

  // Manage user sessions
  const createUserSession = async (sessionToken: string) => {
    if (!user) return;

    try {
      const ipAddress = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => null);

      const userAgent = navigator.userAgent;

      await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          ip_address: ipAddress,
          user_agent: userAgent,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        });
    } catch (error) {
      console.error('Failed to create user session:', error);
    }
  };

  // Update session activity
  const updateSessionActivity = async (sessionToken: string) => {
    try {
      await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_token', sessionToken)
        .eq('user_id', user?.id);
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  };

  // Revoke user session
  const revokeSession = async (sessionId: string) => {
    try {
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
  };

  // GDPR data export request
  const requestDataExport = async () => {
    if (!user) return;

    try {
      await supabase
        .from('gdpr_requests')
        .insert({
          user_id: user.id,
          email: user.email || '',
          request_type: 'data_export',
          requested_data: { tables: ['profiles', 'flows', 'connectors', 'execution_logs'] },
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });
    } catch (error) {
      console.error('Failed to request data export:', error);
      throw error;
    }
  };

  // GDPR data deletion request
  const requestDataDeletion = async () => {
    if (!user) return;

    try {
      await supabase
        .from('gdpr_requests')
        .insert({
          user_id: user.id,
          email: user.email || '',
          request_type: 'data_deletion',
          requested_data: { full_account: true },
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });
    } catch (error) {
      console.error('Failed to request data deletion:', error);
      throw error;
    }
  };

  // Fetch security data
  const fetchSecurityEvents = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) setSecurityEvents(data);
    } catch (error) {
      console.error('Failed to fetch security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (data) setAuditLogs(data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSessions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setUserSessions(data);
    } catch (error) {
      console.error('Failed to fetch user sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGDPRRequests = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .from('gdpr_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setGDPRRequests(data);
    } catch (error) {
      console.error('Failed to fetch GDPR requests:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    securityEvents,
    auditLogs,
    userSessions,
    gdprRequests,
    loading,
    logSecurityEvent,
    trackFailedLogin,
    checkAccountLock,
    createUserSession,
    updateSessionActivity,
    revokeSession,
    requestDataExport,
    requestDataDeletion,
    fetchSecurityEvents,
    fetchAuditLogs,
    fetchUserSessions,
    fetchGDPRRequests
  };
}