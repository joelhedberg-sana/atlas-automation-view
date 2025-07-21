
// Enhanced data models for production-ready Automation Atlas
export interface EnhancedConnector {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: string | null;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  errorCount: number;
  totalFlows: number;
  monthlyExecutions: number;
  avgResponseTime: number;
  apiUsage: {
    used: number;
    limit: number;
    resetDate: string;
  };
}

export interface EnhancedFlow {
  id: string;
  name: string;
  tool: string;
  summary: string;
  duplicateOf: string | null;
  orphan: boolean;
  // Enhanced fields for production
  trigger: {
    type: 'webhook' | 'schedule' | 'manual' | 'event';
    config: Record<string, any>;
  };
  actions: Array<{
    id: string;
    type: string;
    config: Record<string, any>;
  }>;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  lastRun: string | null;
  nextRun: string | null;
  successRate: number;
  avgExecutionTime: number;
  totalExecutions: number;
  monthlyExecutions: number;
  cost: {
    monthly: number;
    perExecution: number;
  };
  performance: {
    errorCount: number;
    warningCount: number;
    avgResponseTime: number;
  };
  owner: string;
  department: 'sales' | 'marketing' | 'support' | 'operations';
  businessValue: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionLog {
  id: string;
  flowId: string;
  status: 'success' | 'failure' | 'warning';
  startTime: string;
  endTime: string;
  duration: number;
  errorMessage?: string;
  dataProcessed: number;
  cost: number;
}

export interface FlowMetrics {
  totalFlows: number;
  activeFlows: number;
  duplicateFlows: number;
  orphanFlows: number;
  totalExecutions: number;
  successRate: number;
  monthlyCost: number;
  avgExecutionTime: number;
  topPerformingFlows: string[];
  problemFlows: string[];
}
