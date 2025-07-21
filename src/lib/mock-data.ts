// Mock data types and arrays for Automation Atlas

export interface Connector {
  id: string;
  name: string;
  status: 'connected' | 'disconnected';
  lastSync: string | null;
}

export interface Flow {
  id: string;
  name: string;
  tool: string;
  summary: string;
  duplicateOf: string | null;
  orphan: boolean;
}

export const mockConnectors: Connector[] = [
  { 
    id: "zapier", 
    name: "Zapier", 
    status: "connected", 
    lastSync: "2025-07-19T14:00:00Z" 
  },
  { 
    id: "make", 
    name: "Make", 
    status: "connected", 
    lastSync: "2025-07-19T13:45:00Z" 
  },
  { 
    id: "hubspot", 
    name: "HubSpot", 
    status: "disconnected", 
    lastSync: null 
  }
];

export const mockFlows: Flow[] = [
  { 
    id: "f1", 
    name: "Deal Won → Slack", 
    tool: "zapier", 
    summary: "Send Slack msg when deal is won", 
    duplicateOf: null, 
    orphan: false 
  },
  { 
    id: "f2", 
    name: "Deal Won → Slack (dup)", 
    tool: "make", 
    summary: "Duplicate of f1 in Make", 
    duplicateOf: "f1", 
    orphan: false 
  },
  { 
    id: "f3", 
    name: "Midnight Cleanup", 
    tool: "hubspot", 
    summary: "Archive stale contacts nightly", 
    duplicateOf: null, 
    orphan: true 
  }
];

export function getConnectorIcon(connectorId: string) {
  const icons = {
    zapier: "⚡",
    make: "🔧", 
    hubspot: "📊"
  };
  return icons[connectorId as keyof typeof icons] || "🔗";
}

export function getFlowStatusColor(flow: Flow) {
  if (flow.duplicateOf) return "duplicate";
  if (flow.orphan) return "orphan"; 
  return "normal";
}