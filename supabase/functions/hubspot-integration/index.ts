import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'connect':
        return await handleConnect(supabase, user.id, params);
      case 'sync':
        return await handleSync(supabase, user.id, params);
      case 'get-workflows':
        return await getWorkflows(supabase, user.id);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in hubspot-integration:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleConnect(supabase: any, userId: string, params: any) {
  const { accessToken, hubId } = params;
  
  // Get user's organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    throw new Error('User profile not found');
  }

  // Create or update HubSpot connector
  const { data: connector, error } = await supabase
    .from('connectors')
    .upsert({
      organization_id: profile.organization_id,
      name: 'HubSpot',
      platform: 'hubspot',
      status: 'connected',
      last_sync: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // Store encrypted access token
  await supabase
    .from('api_keys')
    .upsert({
      connector_id: connector.id,
      key_name: 'access_token',
      encrypted_value: accessToken, // In production, encrypt this
    });

  // Initial sync
  await syncHubSpotWorkflows(supabase, connector.id, accessToken);

  return new Response(
    JSON.stringify({ success: true, connector }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleSync(supabase: any, userId: string, params: any) {
  const { connectorId } = params;

  // Get connector and access token
  const { data: connector } = await supabase
    .from('connectors')
    .select('*, api_keys(*)')
    .eq('id', connectorId)
    .single();

  if (!connector) {
    throw new Error('Connector not found');
  }

  const accessToken = connector.api_keys?.find((key: any) => key.key_name === 'access_token')?.encrypted_value;
  
  if (!accessToken) {
    throw new Error('Access token not found');
  }

  await syncHubSpotWorkflows(supabase, connectorId, accessToken);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function syncHubSpotWorkflows(supabase: any, connectorId: string, accessToken: string) {
  try {
    // Fetch workflows from HubSpot API
    const response = await fetch('https://api.hubapi.com/automation/v3/workflows', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.statusText}`);
    }

    const data = await response.json();
    const workflows = data.results || [];

    // Get connector info
    const { data: connector } = await supabase
      .from('connectors')
      .select('organization_id')
      .eq('id', connectorId)
      .single();

    // Transform and store workflows
    for (const workflow of workflows) {
      const flowData = {
        organization_id: connector.organization_id,
        connector_id: connectorId,
        external_id: workflow.id.toString(),
        name: workflow.name,
        description: workflow.description || '',
        tool: 'hubspot',
        status: workflow.enabled ? 'active' : 'disabled',
        trigger_type: 'event' as const,
        trigger_config: {
          type: workflow.type,
          contactListIds: workflow.contactListIds,
        },
        actions: workflow.actions || [],
        last_run: workflow.lastUpdatedTime ? new Date(workflow.lastUpdatedTime).toISOString() : null,
        total_executions: workflow.numContactsEnrolled || 0,
        department: 'marketing' as const,
        business_value: 'medium' as const,
      };

      await supabase
        .from('flows')
        .upsert(flowData, { 
          onConflict: 'organization_id,external_id,tool',
          ignoreDuplicates: false 
        });
    }

    // Update connector stats
    await supabase
      .from('connectors')
      .update({
        status: 'connected',
        last_sync: new Date().toISOString(),
        total_flows: workflows.length,
      })
      .eq('id', connectorId);

    console.log(`Synced ${workflows.length} HubSpot workflows`);
  } catch (error) {
    console.error('Error syncing HubSpot workflows:', error);
    
    // Update connector status to error
    await supabase
      .from('connectors')
      .update({
        status: 'error',
        error_count: supabase.rpc('increment', { x: 1, current: 'error_count' }),
      })
      .eq('id', connectorId);
    
    throw error;
  }
}

async function getWorkflows(supabase: any, userId: string) {
  // Get user's organization flows
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('user_id', userId)
    .single();

  const { data: flows, error } = await supabase
    .from('flows')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .eq('tool', 'hubspot');

  if (error) throw error;

  return new Response(
    JSON.stringify({ flows }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}