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

    const { 
      searchTerm = '', 
      departments = [], 
      tools = [], 
      status = [], 
      businessValue = [],
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      pageSize = 20
    } = await req.json();

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Build query
    let query = supabase
      .from('flows')
      .select('*, connectors(name, platform, status)')
      .eq('organization_id', profile.organization_id);

    // Apply filters
    if (departments.length > 0) {
      query = query.in('department', departments);
    }

    if (tools.length > 0) {
      query = query.in('tool', tools);
    }

    if (status.length > 0) {
      query = query.in('status', status);
    }

    if (businessValue.length > 0) {
      query = query.in('business_value', businessValue);
    }

    // Apply text search
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);

    const { data: flows, error, count } = await query;

    if (error) throw error;

    // Get aggregated stats
    const statsQuery = supabase
      .from('flows')
      .select('department, tool, status, business_value')
      .eq('organization_id', profile.organization_id);

    const { data: statsData } = await statsQuery;

    const stats = {
      totalFlows: count || 0,
      departments: getUniqueValues(statsData || [], 'department'),
      tools: getUniqueValues(statsData || [], 'tool'),
      statuses: getUniqueValues(statsData || [], 'status'),
      businessValues: getUniqueValues(statsData || [], 'business_value'),
    };

    return new Response(
      JSON.stringify({ 
        flows: flows || [], 
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        },
        stats 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in flow-search:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getUniqueValues(data: any[], field: string): { value: string, count: number }[] {
  const counts = data.reduce((acc, item) => {
    const value = item[field];
    if (value) {
      acc[value] = (acc[value] || 0) + 1;
    }
    return acc;
  }, {});

  return Object.entries(counts).map(([value, count]) => ({ value, count: count as number }));
}