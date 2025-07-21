import { EnhancedConnector, EnhancedFlow, ExecutionLog, FlowMetrics } from './enhanced-data-types';

export const enhancedMockConnectors: EnhancedConnector[] = [
  {
    id: "zapier",
    name: "Zapier",
    status: "connected",
    lastSync: "2025-07-19T14:00:00Z",
    syncFrequency: "realtime",
    errorCount: 2,
    totalFlows: 15,
    monthlyExecutions: 4500,
    avgResponseTime: 1.2,
    apiUsage: {
      used: 3500,
      limit: 10000,
      resetDate: "2025-08-01T00:00:00Z"
    }
  },
  {
    id: "make",
    name: "Make",
    status: "connected",
    lastSync: "2025-07-19T13:45:00Z",
    syncFrequency: "hourly",
    errorCount: 0,
    totalFlows: 8,
    monthlyExecutions: 2100,
    avgResponseTime: 0.8,
    apiUsage: {
      used: 1200,
      limit: 5000,
      resetDate: "2025-08-01T00:00:00Z"
    }
  },
  {
    id: "hubspot",
    name: "HubSpot",
    status: "disconnected",
    lastSync: null,
    syncFrequency: "daily",
    errorCount: 15,
    totalFlows: 12,
    monthlyExecutions: 850,
    avgResponseTime: 3.5,
    apiUsage: {
      used: 0,
      limit: 2500,
      resetDate: "2025-08-01T00:00:00Z"
    }
  },
  {
    id: "salesforce",
    name: "Salesforce",
    status: "error",
    lastSync: "2025-07-18T09:30:00Z",
    syncFrequency: "daily",
    errorCount: 8,
    totalFlows: 20,
    monthlyExecutions: 3245,
    avgResponseTime: 2.1,
    apiUsage: {
      used: 12000,
      limit: 15000,
      resetDate: "2025-08-01T00:00:00Z"
    }
  }
];

export const enhancedMockFlows: EnhancedFlow[] = [
  {
    id: "f1",
    name: "Deal Won → Slack Notification",
    tool: "zapier",
    summary: "Send Slack notification when deal is won in HubSpot",
    duplicateOf: null,
    orphan: false,
    status: "active",
    trigger: {
      type: "webhook",
      config: {
        source: "hubspot",
        event: "deal.updated"
      }
    },
    actions: [
      {
        id: "a1",
        type: "slack_message",
        config: {
          channel: "#sales",
          message: "🎉 New deal won: {{deal.name}} - ${{deal.amount}}"
        }
      }
    ],
    frequency: "realtime",
    lastRun: "2025-07-19T10:30:00Z",
    nextRun: null,
    successRate: 98.5,
    avgExecutionTime: 2.1,
    totalExecutions: 1250,
    monthlyExecutions: 85,
    cost: {
      monthly: 12.50,
      perExecution: 0.15
    },
    performance: {
      errorCount: 8,
      warningCount: 3,
      avgResponseTime: 1.8
    },
    owner: "Sarah Johnson",
    department: "sales",
    businessValue: "high",
    createdAt: "2024-03-15T09:00:00Z",
    updatedAt: "2025-07-18T14:22:00Z"
  },
  {
    id: "f2",
    name: "Deal Won → Slack Alert (Duplicate)",
    tool: "make",
    summary: "Duplicate of f1 created in Make platform",
    duplicateOf: "f1",
    orphan: false,
    status: "active",
    trigger: {
      type: "webhook",
      config: {
        source: "hubspot",
        event: "deal.updated"
      }
    },
    actions: [
      {
        id: "a2",
        type: "slack_message",
        config: {
          channel: "#general",
          message: "Deal won: {{deal.name}}"
        }
      }
    ],
    frequency: "realtime",
    lastRun: "2025-07-19T11:15:00Z",
    nextRun: null,
    successRate: 92.1,
    avgExecutionTime: 3.5,
    totalExecutions: 890,
    monthlyExecutions: 78,
    cost: {
      monthly: 15.60,
      perExecution: 0.20
    },
    performance: {
      errorCount: 15,
      warningCount: 8,
      avgResponseTime: 2.9
    },
    owner: "Mike Chen",
    department: "sales",
    businessValue: "medium",
    createdAt: "2024-05-20T11:30:00Z",
    updatedAt: "2025-07-17T09:45:00Z"
  },
  {
    id: "f3",
    name: "Midnight Contact Archive",
    tool: "hubspot",
    summary: "Archive stale contacts that haven't been active in 6+ months",
    duplicateOf: null,
    orphan: true,
    status: "disabled",
    trigger: {
      type: "schedule",
      config: {
        cron: "0 0 * * *"
      }
    },
    actions: [
      {
        id: "a3",
        type: "contact_update",
        config: {
          property: "lifecycle_stage",
          value: "archived"
        }
      }
    ],
    frequency: "daily",
    lastRun: "2025-06-15T00:00:00Z",
    nextRun: null,
    successRate: 45.2,
    avgExecutionTime: 120.5,
    totalExecutions: 35,
    monthlyExecutions: 2,
    cost: {
      monthly: 8.00,
      perExecution: 4.00
    },
    performance: {
      errorCount: 25,
      warningCount: 12,
      avgResponseTime: 95.2
    },
    owner: "Lisa Park",
    department: "marketing",
    businessValue: "low",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2025-06-15T00:05:00Z"
  },
  {
    id: "f4",
    name: "Lead Scoring & Routing",
    tool: "zapier",
    summary: "Score new leads and route to appropriate sales rep",
    duplicateOf: null,
    orphan: false,
    status: "active",
    trigger: {
      type: "event",
      config: {
        object: "contact",
        event: "created"
      }
    },
    actions: [
      {
        id: "a4",
        type: "score_calculation",
        config: {
          criteria: ["company_size", "industry", "role"]
        }
      },
      {
        id: "a5",
        type: "lead_assignment",
        config: {
          routing_logic: "round_robin"
        }
      }
    ],
    frequency: "realtime",
    lastRun: "2025-07-19T15:22:00Z",
    nextRun: null,
    successRate: 94.8,
    avgExecutionTime: 5.2,
    totalExecutions: 2100,
    monthlyExecutions: 180,
    cost: {
      monthly: 25.00,
      perExecution: 0.14
    },
    performance: {
      errorCount: 12,
      warningCount: 5,
      avgResponseTime: 4.1
    },
    owner: "David Kim",
    department: "marketing",
    businessValue: "high",
    createdAt: "2024-02-28T10:15:00Z",
    updatedAt: "2025-07-19T08:30:00Z"
  }
];

export const mockExecutionLogs: ExecutionLog[] = [
  {
    id: "log1",
    flowId: "f1",
    status: "success",
    startTime: "2025-07-19T10:30:00Z",
    endTime: "2025-07-19T10:30:02Z",
    duration: 2100,
    dataProcessed: 1,
    cost: 0.15
  },
  {
    id: "log2",
    flowId: "f2",
    status: "failure",
    startTime: "2025-07-19T11:15:00Z",
    endTime: "2025-07-19T11:15:05Z",
    duration: 5000,
    errorMessage: "Slack API rate limit exceeded",
    dataProcessed: 0,
    cost: 0.20
  },
  {
    id: "log3",
    flowId: "f4",
    status: "success",
    startTime: "2025-07-19T15:22:00Z",
    endTime: "2025-07-19T15:22:05Z",
    duration: 5200,
    dataProcessed: 1,
    cost: 0.14
  }
];

export const mockFlowMetrics: FlowMetrics = {
  totalFlows: 4,
  activeFlows: 3,
  duplicateFlows: 1,
  orphanFlows: 1,
  totalExecutions: 4275,
  successRate: 82.7,
  monthlyCost: 61.10,
  avgExecutionTime: 32.8,
  topPerformingFlows: ["f1", "f4"],
  problemFlows: ["f3", "f2"]
};