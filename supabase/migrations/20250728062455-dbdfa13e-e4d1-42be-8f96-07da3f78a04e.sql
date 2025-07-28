-- Phase 3: Production-Ready Security Schema

-- Create audit logs table for security monitoring
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security events table for tracking failed attempts
CREATE TABLE public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT,
  event_type TEXT NOT NULL, -- 'failed_login', 'account_locked', 'password_reset', etc.
  ip_address INET,
  user_agent TEXT,
  attempt_count INTEGER DEFAULT 1,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data retention policies table
CREATE TABLE public.data_retention_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  retention_days INTEGER NOT NULL,
  last_cleanup TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create encrypted API keys table (replacing the existing one)
DROP TABLE IF EXISTS public.api_keys;
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connector_id UUID NOT NULL,
  key_name TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  encryption_iv TEXT NOT NULL, -- Initialization vector for AES encryption
  key_hash TEXT NOT NULL, -- Hash for verification without decryption
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user sessions table for enhanced session management
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  session_token TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create GDPR compliance table for tracking consent and data requests
CREATE TABLE public.gdpr_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  request_type TEXT NOT NULL, -- 'data_export', 'data_deletion', 'consent_withdrawal'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled'
  requested_data JSONB DEFAULT '{}'::jsonb,
  processed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all security tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gdpr_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
CREATE POLICY "Audit logs are viewable by organization admins" 
ON public.audit_logs 
FOR SELECT 
USING (
  user_id IN (
    SELECT p.user_id 
    FROM profiles p 
    WHERE p.organization_id = get_current_user_organization_id() 
    AND p.role IN ('admin', 'owner')
  )
);

-- RLS Policies for security_events
CREATE POLICY "Security events are viewable by organization admins" 
ON public.security_events 
FOR SELECT 
USING (
  user_id IN (
    SELECT p.user_id 
    FROM profiles p 
    WHERE p.organization_id = get_current_user_organization_id() 
    AND p.role IN ('admin', 'owner')
  )
);

-- RLS Policies for data_retention_policies
CREATE POLICY "Data retention policies are manageable by organization admins" 
ON public.data_retention_policies 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.organization_id = get_current_user_organization_id() 
    AND p.role IN ('admin', 'owner')
  )
);

-- RLS Policies for api_keys (enhanced security)
CREATE POLICY "API keys are viewable by organization members" 
ON public.api_keys 
FOR SELECT 
USING (
  connector_id IN (
    SELECT c.id 
    FROM connectors c 
    JOIN profiles p ON c.organization_id = p.organization_id 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "API keys are manageable by organization admins" 
ON public.api_keys 
FOR ALL 
USING (
  connector_id IN (
    SELECT c.id 
    FROM connectors c 
    JOIN profiles p ON c.organization_id = p.organization_id 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('admin', 'owner')
  )
);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own sessions" 
ON public.user_sessions 
FOR ALL 
USING (user_id = auth.uid());

-- RLS Policies for gdpr_requests
CREATE POLICY "Users can view their own GDPR requests" 
ON public.gdpr_requests 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own GDPR requests" 
ON public.gdpr_requests 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Organization admins can view all GDPR requests" 
ON public.gdpr_requests 
FOR SELECT 
USING (
  user_id IN (
    SELECT p.user_id 
    FROM profiles p 
    WHERE p.organization_id = get_current_user_organization_id() 
    AND p.role IN ('admin', 'owner')
  )
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_security_events_email ON public.security_events(email);
CREATE INDEX idx_security_events_ip_address ON public.security_events(ip_address);
CREATE INDEX idx_api_keys_connector_id ON public.api_keys(connector_id);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX idx_gdpr_requests_user_id ON public.gdpr_requests(user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_security_events_updated_at
  BEFORE UPDATE ON public.security_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_retention_policies_updated_at
  BEFORE UPDATE ON public.data_retention_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gdpr_requests_updated_at
  BEFORE UPDATE ON public.gdpr_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data retention policies
INSERT INTO public.data_retention_policies (table_name, retention_days) VALUES
('audit_logs', 365),
('security_events', 90),
('execution_logs', 180),
('user_sessions', 30);