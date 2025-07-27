import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

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

    const { action, flowId, flowIds } = await req.json();

    switch (action) {
      case 'analyze-single':
        return await analyzeSingleFlow(supabase, openAIApiKey, user.id, flowId);
      case 'analyze-batch':
        return await analyzeBatchFlows(supabase, openAIApiKey, user.id, flowIds);
      case 'detect-duplicates':
        return await detectDuplicates(supabase, openAIApiKey, user.id);
      case 'calculate-roi':
        return await calculateROI(supabase, user.id, flowId);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in ai-flow-analyzer:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function analyzeSingleFlow(supabase: any, openAIApiKey: string, userId: string, flowId: string) {
  // Get flow data
  const { data: flow, error } = await supabase
    .from('flows')
    .select('*')
    .eq('id', flowId)
    .single();

  if (error || !flow) {
    throw new Error('Flow not found');
  }

  // Generate AI analysis
  const analysis = await generateFlowAnalysis(openAIApiKey, flow);

  // Update flow with AI insights
  await supabase
    .from('flows')
    .update({
      ai_documentation: analysis.documentation,
      ai_insights: analysis.insights,
    })
    .eq('id', flowId);

  return new Response(
    JSON.stringify({ analysis }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateFlowAnalysis(openAIApiKey: string, flow: any) {
  const prompt = `Analyze this automation flow and provide comprehensive documentation and insights:

Flow Details:
- Name: ${flow.name}
- Tool: ${flow.tool}
- Description: ${flow.description || 'No description provided'}
- Trigger Type: ${flow.trigger_type}
- Trigger Config: ${JSON.stringify(flow.trigger_config, null, 2)}
- Actions: ${JSON.stringify(flow.actions, null, 2)}
- Department: ${flow.department}
- Status: ${flow.status}
- Executions: ${flow.total_executions}
- Success Rate: ${flow.success_rate}%

Please provide:
1. A clear, business-friendly explanation of what this automation does
2. The business value and impact
3. Potential optimization opportunities
4. Risk assessment and potential failure points
5. Recommendations for improvement

Format your response as JSON with keys: documentation, businessValue, optimizations, risks, recommendations`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert automation analyst specializing in RevOps workflows. Provide detailed, actionable insights about automation flows.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;

  try {
    const analysis = JSON.parse(aiResponse);
    return {
      documentation: analysis.documentation,
      insights: {
        businessValue: analysis.businessValue,
        optimizations: analysis.optimizations,
        risks: analysis.risks,
        recommendations: analysis.recommendations,
        analyzedAt: new Date().toISOString(),
      }
    };
  } catch (parseError) {
    // Fallback if JSON parsing fails
    return {
      documentation: aiResponse,
      insights: {
        businessValue: "AI analysis generated",
        optimizations: [],
        risks: [],
        recommendations: [],
        analyzedAt: new Date().toISOString(),
      }
    };
  }
}

async function analyzeBatchFlows(supabase: any, openAIApiKey: string, userId: string, flowIds: string[]) {
  const results = [];

  for (const flowId of flowIds) {
    try {
      const analysis = await analyzeSingleFlow(supabase, openAIApiKey, userId, flowId);
      results.push({ flowId, success: true, analysis });
    } catch (error) {
      results.push({ flowId, success: false, error: error.message });
    }
  }

  return new Response(
    JSON.stringify({ results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function detectDuplicates(supabase: any, openAIApiKey: string, userId: string) {
  // Get user's organization flows
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('user_id', userId)
    .single();

  const { data: flows, error } = await supabase
    .from('flows')
    .select('*')
    .eq('organization_id', profile.organization_id);

  if (error) throw error;

  // Use AI to detect potential duplicates
  const duplicateGroups = [];
  
  for (let i = 0; i < flows.length; i++) {
    for (let j = i + 1; j < flows.length; j++) {
      const similarity = await analyzeSimilarity(openAIApiKey, flows[i], flows[j]);
      
      if (similarity.score > 0.7) {
        duplicateGroups.push({
          flows: [flows[i], flows[j]],
          similarity: similarity.score,
          reason: similarity.reason,
        });
      }
    }
  }

  return new Response(
    JSON.stringify({ duplicateGroups }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function analyzeSimilarity(openAIApiKey: string, flow1: any, flow2: any) {
  const prompt = `Compare these two automation flows and determine if they are duplicates or very similar:

Flow 1:
- Name: ${flow1.name}
- Tool: ${flow1.tool}
- Trigger: ${JSON.stringify(flow1.trigger_config)}
- Actions: ${JSON.stringify(flow1.actions)}

Flow 2:
- Name: ${flow2.name}
- Tool: ${flow2.tool}
- Trigger: ${JSON.stringify(flow2.trigger_config)}
- Actions: ${JSON.stringify(flow2.actions)}

Provide a similarity score (0-1) and reason. Format as JSON: {"score": 0.8, "reason": "explanation"}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing automation workflows for duplicates and similarities.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;

  try {
    return JSON.parse(aiResponse);
  } catch {
    return { score: 0, reason: "Analysis failed" };
  }
}

async function calculateROI(supabase: any, userId: string, flowId: string) {
  const { data: flow } = await supabase
    .from('flows')
    .select('*')
    .eq('id', flowId)
    .single();

  if (!flow) {
    throw new Error('Flow not found');
  }

  // Calculate ROI based on automation metrics
  const hoursPerExecution = estimateTimePerExecution(flow);
  const hourlyRate = getDepartmentHourlyRate(flow.department);
  const monthlySavings = (flow.monthly_executions || 0) * hoursPerExecution * hourlyRate;
  const annualSavings = monthlySavings * 12;
  const monthlyCost = flow.monthly_cost || 50; // Default platform cost
  const roi = monthlyCost > 0 ? ((monthlySavings - monthlyCost) / monthlyCost) * 100 : 0;

  const roiData = {
    monthlySavings,
    annualSavings,
    monthlyCost,
    roi,
    hoursPerExecution,
    hourlyRate,
    calculatedAt: new Date().toISOString(),
  };

  // Update flow with ROI data
  await supabase
    .from('flows')
    .update({
      ai_insights: {
        ...flow.ai_insights,
        roi: roiData,
      }
    })
    .eq('id', flowId);

  return new Response(
    JSON.stringify({ roi: roiData }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function estimateTimePerExecution(flow: any): number {
  // Estimate time saved per execution based on flow complexity
  const actionCount = Array.isArray(flow.actions) ? flow.actions.length : 1;
  
  if (flow.tool === 'hubspot') return 0.25 + (actionCount * 0.1);
  if (flow.tool === 'zapier') return 0.15 + (actionCount * 0.05);
  if (flow.tool === 'lemlist') return 0.5 + (actionCount * 0.1);
  
  return 0.2; // Default
}

function getDepartmentHourlyRate(department: string): number {
  const rates = {
    'sales': 75,
    'marketing': 65,
    'support': 45,
    'operations': 55,
    'revops': 85,
  };
  
  return rates[department as keyof typeof rates] || 60;
}