-- Phase 3: Add RLS Policies for Security Tables

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