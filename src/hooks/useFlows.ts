import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedFlow } from '@/lib/enhanced-data-types';
import { toast } from './use-toast';

export const useFlows = () => {
  const [flows, setFlows] = useState<EnhancedFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlows = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('flows')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform database data to match EnhancedFlow interface
      const enhancedFlows: EnhancedFlow[] = (data || []).map(flow => ({
        id: flow.id,
        name: flow.name,
        tool: flow.tool,
        summary: flow.summary || '',
        duplicateOf: flow.duplicate_of,
        orphan: flow.orphan || false,
        status: flow.status,
        trigger: {
          type: flow.trigger_type,
          config: typeof flow.trigger_config === 'object' && flow.trigger_config !== null 
            ? flow.trigger_config as Record<string, any>
            : {}
        },
        actions: Array.isArray(flow.actions) 
          ? flow.actions as Array<{id: string; type: string; config: Record<string, any>}>
          : [],
        frequency: flow.frequency,
        lastRun: flow.last_run,
        nextRun: flow.next_run,
        successRate: typeof flow.success_rate === 'number' 
          ? flow.success_rate 
          : parseFloat(String(flow.success_rate)) || 0,
        avgExecutionTime: typeof flow.avg_execution_time === 'number' 
          ? flow.avg_execution_time 
          : parseFloat(String(flow.avg_execution_time)) || 0,
        totalExecutions: flow.total_executions || 0,
        monthlyExecutions: flow.monthly_executions || 0,
        cost: {
          monthly: typeof flow.monthly_cost === 'number' 
            ? flow.monthly_cost 
            : parseFloat(String(flow.monthly_cost)) || 0,
          perExecution: typeof flow.cost_per_execution === 'number' 
            ? flow.cost_per_execution 
            : parseFloat(String(flow.cost_per_execution)) || 0
        },
        performance: {
          errorCount: flow.error_count || 0,
          warningCount: flow.warning_count || 0,
          avgResponseTime: typeof flow.avg_response_time === 'number' 
            ? flow.avg_response_time 
            : parseFloat(String(flow.avg_response_time)) || 0
        },
        owner: flow.owner_id || 'Unknown',
        department: (['sales', 'marketing', 'support', 'operations'].includes(flow.department)) 
          ? flow.department as 'sales' | 'marketing' | 'support' | 'operations'
          : 'operations',
        businessValue: flow.business_value || 'medium',
        createdAt: flow.created_at,
        updatedAt: flow.updated_at
      }));

      setFlows(enhancedFlows);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch flows';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlows();
  }, []);

  return {
    flows,
    loading,
    error,
    refetch: fetchFlows
  };
};