import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FlowMetrics } from '@/lib/enhanced-data-types';
import { toast } from './use-toast';

export const useFlowMetrics = () => {
  const [metrics, setMetrics] = useState<FlowMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch flows and execution logs to calculate metrics
      const [flowsResult, executionLogsResult] = await Promise.all([
        supabase.from('flows').select('*'),
        supabase.from('execution_logs').select('*')
      ]);

      if (flowsResult.error) throw flowsResult.error;
      if (executionLogsResult.error) throw executionLogsResult.error;

      const flows = flowsResult.data || [];
      const executionLogs = executionLogsResult.data || [];

      // Calculate metrics from real data
      const totalFlows = flows.length;
      const activeFlows = flows.filter(f => f.status === 'active').length;
      const duplicateFlows = flows.filter(f => f.duplicate_of !== null).length;
      const orphanFlows = flows.filter(f => f.orphan === true).length;

      const totalExecutions = executionLogs.length;
      const successfulExecutions = executionLogs.filter(log => log.status === 'success').length;
      const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

      const monthlyCost = flows.reduce((sum, flow) => {
        const cost = typeof flow.monthly_cost === 'number' 
          ? flow.monthly_cost 
          : parseFloat(String(flow.monthly_cost)) || 0;
        return sum + cost;
      }, 0);

      const avgExecutionTime = flows.length > 0 
        ? flows.reduce((sum, flow) => {
            const execTime = typeof flow.avg_execution_time === 'number' 
              ? flow.avg_execution_time 
              : parseFloat(String(flow.avg_execution_time)) || 0;
            return sum + execTime;
          }, 0) / flows.length 
        : 0;

      // Identify top performing and problem flows
      const sortedBySuccess = flows
        .filter(f => f.status === 'active')
        .sort((a, b) => {
          const aRate = typeof a.success_rate === 'number' 
            ? a.success_rate 
            : parseFloat(String(a.success_rate)) || 0;
          const bRate = typeof b.success_rate === 'number' 
            ? b.success_rate 
            : parseFloat(String(b.success_rate)) || 0;
          return bRate - aRate;
        });
      
      const topPerformingFlows = sortedBySuccess.slice(0, 3).map(f => f.id);
      const problemFlows = flows
        .filter(f => {
          const successRate = typeof f.success_rate === 'number' 
            ? f.success_rate 
            : parseFloat(String(f.success_rate)) || 0;
          return successRate < 80 || (f.error_count || 0) > 5;
        })
        .map(f => f.id);

      const calculatedMetrics: FlowMetrics = {
        totalFlows,
        activeFlows,
        duplicateFlows,
        orphanFlows,
        totalExecutions,
        successRate,
        monthlyCost,
        avgExecutionTime,
        topPerformingFlows,
        problemFlows
      };

      setMetrics(calculatedMetrics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate metrics';
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
    calculateMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: calculateMetrics
  };
};