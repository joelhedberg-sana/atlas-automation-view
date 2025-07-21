
import { EnhancedConnector } from "@/lib/enhanced-data-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertTriangle, Activity, TrendingUp } from "lucide-react";
import { getConnectorIcon } from "@/lib/mock-data";

interface EnhancedConnectorCardProps {
  connector: EnhancedConnector;
}

export function EnhancedConnectorCard({ connector }: EnhancedConnectorCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'error': return 'destructive';
      case 'syncing': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-status-connected';
      case 'error': return 'text-status-disconnected';
      case 'syncing': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const usagePercentage = (connector.apiUsage.used / connector.apiUsage.limit) * 100;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getConnectorIcon(connector.id)}</span>
            <CardTitle className="text-lg">{connector.name}</CardTitle>
          </div>
          <Badge variant={getStatusVariant(connector.status)}>
            {connector.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Flows</span>
            </div>
            <div className="font-semibold">{connector.totalFlows}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Monthly Runs</span>
            </div>
            <div className="font-semibold">{connector.monthlyExecutions.toLocaleString()}</div>
          </div>
        </div>

        {/* API Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">API Usage</span>
            <span className="font-medium">
              {connector.apiUsage.used.toLocaleString()} / {connector.apiUsage.limit.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={usagePercentage} 
            className="h-2"
          />
        </div>

        {/* Performance & Errors */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Avg Response</span>
            <span className="font-medium">{connector.avgResponseTime}s</span>
          </div>
          
          {connector.errorCount > 0 && (
            <div className="flex items-center gap-1 text-status-disconnected">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-medium">{connector.errorCount}</span>
            </div>
          )}
        </div>

        {/* Last Sync */}
        <div className="text-xs text-muted-foreground">
          Last sync: {connector.lastSync 
            ? new Date(connector.lastSync).toLocaleString()
            : 'Never'
          }
        </div>
      </CardContent>
    </Card>
  );
}
