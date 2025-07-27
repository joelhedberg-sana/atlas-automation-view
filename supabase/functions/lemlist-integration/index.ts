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
      case 'get-campaigns':
        return await getCampaigns(supabase, user.id);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in lemlist-integration:', error);
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
  const testResponse = await fetch('https://api.lemlist.com/api/campaigns', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!testResponse.ok) {
    throw new Error('Invalid Lemlist API key');
  }

  // Create or update Lemlist connector
  const { data: connector, error } = await supabase
    .from('connectors')
    .upsert({
      organization_id: profile.organization_id,
      name: 'Lemlist',
      platform: 'lemlist',
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
  await syncLemlistCampaigns(supabase, connector.id, apiKey);

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

  await syncLemlistCampaigns(supabase, connectorId, apiKey);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function syncLemlistCampaigns(supabase: any, connectorId: string, apiKey: string) {
  try {
    // Fetch campaigns from Lemlist API
    const response = await fetch('https://api.lemlist.com/api/campaigns', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Lemlist API error: ${response.statusText}`);
    }

    const campaigns = await response.json();

    // Get connector info
    const { data: connector } = await supabase
      .from('connectors')
      .select('organization_id')
      .eq('id', connectorId)
      .single();

    // Transform and store campaigns
    for (const campaign of campaigns) {
      const flowData = {
        organization_id: connector.organization_id,
        connector_id: connectorId,
        external_id: campaign._id,
        name: campaign.name,
        description: campaign.description || '',
        tool: 'lemlist',
        status: campaign.isActive ? 'active' : 'disabled',
        trigger_type: 'schedule' as const,
        trigger_config: {
          timezone: campaign.timezone,
          schedule: campaign.schedule,
        },
        actions: [{
          type: 'email_sequence',
          steps: campaign.steps?.length || 0,
          id: campaign._id,
        }],
        last_run: campaign.lastActivity ? new Date(campaign.lastActivity).toISOString() : null,
        total_executions: campaign.stats?.sent || 0,
        success_rate: campaign.stats?.openRate || 0,
        department: 'marketing' as const,
        business_value: inferBusinessValue(campaign),
        tags: campaign.tags || [],
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
        total_flows: campaigns.length,
        monthly_executions: campaigns.reduce((sum: number, campaign: any) => sum + (campaign.stats?.sent || 0), 0),
      })
      .eq('id', connectorId);

    console.log(`Synced ${campaigns.length} Lemlist campaigns`);
  } catch (error) {
    console.error('Error syncing Lemlist campaigns:', error);
    
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

function inferBusinessValue(campaign: any): string {
  const sent = campaign.stats?.sent || 0;
  const openRate = campaign.stats?.openRate || 0;
  
  if (sent > 1000 && openRate > 0.3) return 'high';
  if (sent > 100 && openRate > 0.2) return 'medium';
  return 'low';
}

async function getCampaigns(supabase: any, userId: string) {
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
    .eq('tool', 'lemlist');

  if (error) throw error;

  return new Response(
    JSON.stringify({ flows }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}