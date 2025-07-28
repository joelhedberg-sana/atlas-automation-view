import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedConnector } from '@/lib/enhanced-data-types';
import { toast } from './use-toast';

export const useConnectors = () => {
  const [connectors, setConnectors] = useState<EnhancedConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnectors = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('connectors')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      // Transform database data to match EnhancedConnector interface
      const enhancedConnectors: EnhancedConnector[] = (data || []).map(connector => ({
        id: connector.id,
        name: connector.name,
        status: connector.status,
        lastSync: connector.last_sync,
        syncFrequency: connector.sync_frequency,
        errorCount: connector.error_count || 0,
        totalFlows: connector.total_flows || 0,
        monthlyExecutions: connector.monthly_executions || 0,
        avgResponseTime: typeof connector.avg_response_time === 'number' 
          ? connector.avg_response_time 
          : parseFloat(String(connector.avg_response_time)) || 0,
        apiUsage: {
          used: connector.api_usage_used || 0,
          limit: connector.api_usage_limit || 1000,
          resetDate: connector.api_usage_reset_date || new Date().toISOString()
        }
      }));

      setConnectors(enhancedConnectors);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch connectors';
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
    fetchConnectors();
  }, []);

  return {
    connectors,
    loading,
    error,
    refetch: fetchConnectors
  };
};