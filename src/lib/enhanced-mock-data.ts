
import { EnhancedConnector, EnhancedFlow, ExecutionLog, FlowMetrics } from './enhanced-data-types';

export const enhancedMockConnectors: EnhancedConnector[] = [
  {
    id: "zapier",
    name: "Zapier",
    status: "connected",
    lastSync: "2025-07-21T08:30:00Z",
    syncFrequency: "realtime",
    errorCount: 2,
    totalFlows: 12,
    monthlyExecutions: 1847,
    avgResponseTime: 1.2,
    apiUsage: {
      used: 8456,
      limit: 10000,
      resetDate: "2025-08-01T00:00:00Z"
    }
  },
  {
    id: "make",
    name: "Make",
    status: "connected",
    lastSync: "2025-07-21T08:25:00Z",
    syncFrequency: "hourly",
    errorCount: 0,
    totalFlows: 8,
    monthlyExecutions: 923,
    avgResponseTime: 0.8,
    apiUsage: {
      used: 4200,
      limit: 10000,
      resetDate: "2025-08-01T00:00:00Z"
    }
  },
  {
    id: "hubspot",
    name: "HubSpot",
    status: "error",
    lastSync: "2025-07-20T14:30:00Z",
    syncFrequency: "daily",
    errorCount: 5,
    totalFlows: 15,
    monthlyExecutions: 0,
    avgResponseTime: 0,
    apiUsage: {
      used: 0,
      limit: 5000,
      resetDate: "2025-08-01T00:00:00Z"
    }
  },
  {
    id: "salesforce",
    name: "Salesforce",
    status: "connected",
    lastSync: "2025-07-21T08:00:00Z",
    syncFrequency: "realtime",
    errorCount: 1,
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
    summary: "Send Slack message when deal is won in Salesforce",
    duplicateOf: null,
    orphan: false,
    trigger: {
      type: "webhook",
      config: { source: "salesforce", event: "deal_won" }
    },
    actions: [
      { id: "a1", type: "slack_message", config: { channel: "#sales", template: "deal_won" } }
    ],
    frequency: "realtime",
    lastRun: "2025-07-21T07:45:00Z",
    nextRun: null,
    successRate: 98.5,
    avgExecutionTime: 1.2,
    totalExecutions: 234,
    monthlyExecutions: 47,
    cost: {
      monthly: 23.50,
      perExecution: 0.50
    },
    performance: {
      errorCount: 3,
      warningCount: 1,
      avgResponseTime: 1.2
    },
    owner: "john.doe@company.com",
    department: "sales",
    businessValue: "high",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-07-20T16:30:00Z"
  },
  {
    id: "f2",
    name: "Deal Won → Slack (Duplicate)",
    tool: "make",
    summary: "Duplicate automation for deal won notifications",
    duplicateOf: "f1",
    orphan: false,
    trigger: {
      type: "webhook",
      config: { source: "salesforce", event: "deal_won" }
    },
    actions: [
      { id: "a2", type: "slack_message", config: { channel: "#sales", template: "deal_won_alt" } }
    ],
    frequency: "realtime",
    lastRun: "2025-07-21T07:45:00Z",
    nextRun: null,
    successRate: 95.2,
    avgExecutionTime: 0.8,
    totalExecutions: 234,
    monthlyExecutions: 47,
    cost: {
      monthly: 18.80,
      perExecution: 0.40
    },
    performance: {
      errorCount: 8,
      warningCount: 2,
      avgResponseTime: 0.8
    },
    owner: "jane.smith@company.com",
    department: "sales",
    businessValue: "low",
    createdAt: "2025-03-10T14:00:00Z",
    updatedAt: "2025-07-18T09:15:00Z"
  },
  {
    id: "f3",
    name: "Lead Score Update",
    tool: "hubspot",
    summary: "Update lead scores based on website activity",
    duplicateOf: null,
    orphan: true,
    trigger: {
      type: "schedule",
      config: { cron: "0 */6 * * *" }
    },
    actions: [
      { id: "a3", type: "update_property", config: { property: "lead_score", calculation: "activity_based" } }
    ],
    frequency: "hourly",
    lastRun: "2025-07-19T18:00:00Z",
    nextRun: null,
    successRate: 0,
    avgExecutionTime: 0,
    totalExecutions: 0,
    monthlyExecutions: 0,
    cost: {
      monthly: 0,
      perExecution: 0.25
    },
    performance: {
      errorCount: 15,
      warningCount: 0,
      avgResponseTime: 0
    },
    owner: "mike.wilson@company.com",
    department: "marketing",
    businessValue: "medium",
    createdAt: "2025-02-20T11:00:00Z",
    updatedAt: "2025-07-19T18:00:00Z"
  },
  {
    id: "f4",
    name: "New Customer Onboarding",
    tool: "salesforce",
    summary: "Trigger onboarding sequence for new customers",
    duplicateOf: null,
    orphan: false,
    trigger: {
      type: "event",
      config: { object: "opportunity", event: "closed_won" }
    },
    actions: [
      { id: "a4", type: "create_task", config: { assignee: "success_team", priority: "high" } },
      { id: "a5", type: "send_email", config: { template: "welcome_customer" } }
    ],
    frequency: "realtime",
    lastRun: "2025-07-21T06:30:00Z",
    nextRun: null,
    successRate: 99.1,
    avgExecutionTime: 2.5,
    totalExecutions: 89,
    monthlyExecutions: 23,
    cost: {
      monthly: 57.50,
      perExecution: 2.50
    },
    performance: {
      errorCount: 1,
      warningCount: 0,
      avgResponseTime: 2.5
    },
    owner: "sarah.johnson@company.com",
    department: "support",
    businessValue: "high",
    createdAt: "2025-01-08T09:00:00Z",
    updatedAt: "2025-07-15T14:20:00Z"
  }
];

export const mockExecutionLogs: ExecutionLog[] = [
  {
    id: "log1",
    flowId: "f1",
    status: "success",
    startTime: "2025-07-21T07:45:00Z",
    endTime: "2025-07-21T07:45:01.2Z",
    duration: 1.2,
    dataProcessed: 1,
    cost: 0.50
  },
  {
    id: "log2",
    flowId: "f2",
    status: "success",
    startTime: "2025-07-21T07:45:00Z",
    endTime: "2025-07-21T07:45:00.8Z",
    duration: 0.8,
    dataProcessed: 1,
    cost: 0.40
  },
  {
    id: "log3",
    flowId: "f3",
    status: "failure",
    startTime: "2025-07-19T18:00:00Z",
    endTime: "2025-07-19T18:00:05Z",
    duration: 5.0,
    errorMessage: "HubSpot API authentication failed",
    dataProcessed: 0,
    cost: 0
  }
];

export const mockFlowMetrics: FlowMetrics = {
  totalFlows: 55,
  activeFlows: 52,
  duplicateFlows: 3,
  orphanFlows: 8,
  totalExecutions: 8934,
  successRate: 96.8,
  monthlyCost: 1247.80,
  avgExecutionTime: 1.8,
  topPerformingFlows: ["f1", "f4"],
  problemFlows: ["f3", "f7", "f12"]
};
