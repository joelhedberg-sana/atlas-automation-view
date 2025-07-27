-- Phase 1: Database Foundation Schema
-- Create enum types
CREATE TYPE public.connector_status AS ENUM ('connected', 'disconnected', 'error', 'syncing');
CREATE TYPE public.flow_status AS ENUM ('active', 'disabled', 'error');
CREATE TYPE public.trigger_type AS ENUM ('webhook', 'schedule', 'manual', 'event');
CREATE TYPE public.department_type AS ENUM ('sales', 'marketing', 'support', 'operations', 'revops');
CREATE TYPE public.business_value AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.sync_frequency AS ENUM ('realtime', 'hourly', 'daily', 'weekly');
CREATE TYPE public.user_role AS ENUM ('admin', 'editor', 'viewer');

-- Organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Users/Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  department department_type,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Connectors table
CREATE TABLE public.connectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'hubspot', 'zapier', 'lemlist'
  status connector_status NOT NULL DEFAULT 'disconnected',
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_frequency sync_frequency NOT NULL DEFAULT 'hourly',
  error_count INTEGER DEFAULT 0,
  total_flows INTEGER DEFAULT 0,
  monthly_executions INTEGER DEFAULT 0,
  avg_response_time NUMERIC DEFAULT 0,
  api_usage_used INTEGER DEFAULT 0,
  api_usage_limit INTEGER DEFAULT 1000,
  api_usage_reset_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Encrypted API Keys table
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connector_id UUID NOT NULL REFERENCES public.connectors(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Flows table
CREATE TABLE public.flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  connector_id UUID NOT NULL REFERENCES public.connectors(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL, -- ID from external platform
  name TEXT NOT NULL,
  description TEXT,
  tool TEXT NOT NULL,
  summary TEXT,
  duplicate_of UUID REFERENCES public.flows(id),
  orphan BOOLEAN DEFAULT FALSE,
  status flow_status NOT NULL DEFAULT 'active',
  trigger_type trigger_type NOT NULL,
  trigger_config JSONB DEFAULT '{}',
  actions JSONB DEFAULT '[]',
  frequency sync_frequency NOT NULL DEFAULT 'daily',
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  success_rate NUMERIC DEFAULT 0,
  avg_execution_time NUMERIC DEFAULT 0,
  total_executions INTEGER DEFAULT 0,
  monthly_executions INTEGER DEFAULT 0,
  monthly_cost NUMERIC DEFAULT 0,
  cost_per_execution NUMERIC DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  warning_count INTEGER DEFAULT 0,
  avg_response_time NUMERIC DEFAULT 0,
  owner_id UUID REFERENCES public.profiles(id),
  department department_type,
  business_value business_value DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  ai_documentation TEXT,
  ai_insights JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, external_id, tool)
);

-- Execution logs table
CREATE TABLE public.execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
  external_execution_id TEXT,
  status TEXT NOT NULL, -- 'success', 'failure', 'warning'
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration NUMERIC,
  error_message TEXT,
  data_processed INTEGER DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization-based access
CREATE POLICY "Users can view their organization's data" ON public.organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Profiles are viewable by organization members" ON public.profiles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Connectors are viewable by organization members" ON public.connectors
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "API keys are viewable by organization members" ON public.api_keys
  FOR SELECT USING (
    connector_id IN (
      SELECT c.id FROM public.connectors c
      JOIN public.profiles p ON c.organization_id = p.organization_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Flows are viewable by organization members" ON public.flows
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Execution logs are viewable by organization members" ON public.execution_logs
  FOR SELECT USING (
    flow_id IN (
      SELECT f.id FROM public.flows f
      JOIN public.profiles p ON f.organization_id = p.organization_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Trigger for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_connectors_updated_at BEFORE UPDATE ON public.connectors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON public.api_keys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flows_updated_at BEFORE UPDATE ON public.flows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();