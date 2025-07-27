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
      case 'get-zaps':
        return await getZaps(supabase, user.id);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in zapier-integration:', error);
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
  const { apiKey } = params;
  
  // Get user's organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    throw new Error('User profile not found');
  }

  // Test API key by making a test request
  const testResponse = await fetch('https://zapier.com/api/v4/zaps', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!testResponse.ok) {
    throw new Error('Invalid Zapier API key');
  }

  // Create or update Zapier connector
  const { data: connector, error } = await supabase
    .from('connectors')
    .upsert({
      organization_id: profile.organization_id,
      name: 'Zapier',
      platform: 'zapier',
      status: 'connected',
      last_sync: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // Store encrypted API key
  await supabase
    .from('api_keys')
    .upsert({
      connector_id: connector.id,
      key_name: 'api_key',
      encrypted_value: apiKey, // In production, encrypt this
    });

  // Initial sync
  await syncZapierZaps(supabase, connector.id, apiKey);

  return new Response(
    JSON.stringify({ success: true, connector }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleSync(supabase: any, userId: string, params: any) {
  const { connectorId } = params;

  // Get connector and API key
  const { data: connector } = await supabase
    .from('connectors')
    .select('*, api_keys(*)')
    .eq('id', connectorId)
    .single();

  if (!connector) {
    throw new Error('Connector not found');
  }

  const apiKey = connector.api_keys?.find((key: any) => key.key_name === 'api_key')?.encrypted_value;
  
  if (!apiKey) {
    throw new Error('API key not found');
  }

  await syncZapierZaps(supabase, connectorId, apiKey);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function syncZapierZaps(supabase: any, connectorId: string, apiKey: string) {
  try {
    // Fetch Zaps from Zapier API
    const response = await fetch('https://zapier.com/api/v4/zaps', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Zapier API error: ${response.statusText}`);
    }

    const data = await response.json();
    const zaps = data.results || [];

    // Get connector info
    const { data: connector } = await supabase
      .from('connectors')
      .select('organization_id')
      .eq('id', connectorId)
      .single();

    // Transform and store Zaps
    for (const zap of zaps) {
      const flowData = {
        organization_id: connector.organization_id,
        connector_id: connectorId,
        external_id: zap.id.toString(),
        name: zap.title || zap.name,
        description: zap.description || '',
        tool: 'zapier',
        status: zap.status === 'on' ? 'active' : 'disabled',
        trigger_type: 'webhook' as const,
        trigger_config: {
          app: zap.trigger?.app?.title,
          event: zap.trigger?.event,
        },
        actions: zap.actions?.map((action: any) => ({
          app: action.app?.title,
          event: action.event,
          id: action.id,
        })) || [],
        last_run: zap.last_trigger_time ? new Date(zap.last_trigger_time).toISOString() : null,
        total_executions: zap.task_count || 0,
        monthly_executions: zap.tasks_this_month || 0,
        department: inferDepartment(zap),
        business_value: inferBusinessValue(zap),
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
        total_flows: zaps.length,
        monthly_executions: zaps.reduce((sum: number, zap: any) => sum + (zap.tasks_this_month || 0), 0),
      })
      .eq('id', connectorId);

    console.log(`Synced ${zaps.length} Zapier Zaps`);
  } catch (error) {
    console.error('Error syncing Zapier Zaps:', error);
    
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

function inferDepartment(zap: any): string {
  const triggerApp = zap.trigger?.app?.title?.toLowerCase() || '';
  const actionApps = zap.actions?.map((a: any) => a.app?.title?.toLowerCase()).join(' ') || '';
  const allApps = (triggerApp + ' ' + actionApps).toLowerCase();

  if (allApps.includes('salesforce') || allApps.includes('hubspot') || allApps.includes('pipedrive')) {
    return 'sales';
  } else if (allApps.includes('mailchimp') || allApps.includes('google ads') || allApps.includes('facebook')) {
    return 'marketing';
  } else if (allApps.includes('zendesk') || allApps.includes('intercom') || allApps.includes('freshdesk')) {
    return 'support';
  } else {
    return 'operations';
  }
}

function inferBusinessValue(zap: any): string {
  const taskCount = zap.task_count || 0;
  
  if (taskCount > 1000) return 'high';
  if (taskCount > 100) return 'medium';
  return 'low';
}

async function getZaps(supabase: any, userId: string) {
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
    .eq('tool', 'zapier');

  if (error) throw error;

  return new Response(
    JSON.stringify({ flows }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}