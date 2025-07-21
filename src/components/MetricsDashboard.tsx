
import { FlowMetrics } from "@/lib/enhanced-data-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, DollarSign, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface MetricsDashboardProps {
  metrics: FlowMetrics;
}

export function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  const successRateColor = metrics.successRate >= 95 ? "text-status-connected" : 
                          metrics.successRate >= 90 ? "text-yellow-600" : "text-status-disconnected";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Flows */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Flows</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalFlows}</div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-3 w-3 text-status-connected" />
            <span>{metrics.activeFlows} active</span>
          </div>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${successRateColor}`}>
            {metrics.successRate}%
          </div>
          <Progress value={metrics.successRate} className="h-2 mt-2" />
        </CardContent>
      </Card>

      {/* Monthly Cost */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.monthlyCost.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">
            {metrics.totalExecutions.toLocaleString()} executions
          </div>
        </CardContent>
      </Card>

      {/* Issues */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Issues</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-status-disconnected">
            {metrics.duplicateFlows + metrics.orphanFlows}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="text-status-duplicate">
              {metrics.duplicateFlows} duplicates
            </Badge>
            <Badge variant="outline" className="text-status-orphan">
              {metrics.orphanFlows} orphans
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Average Execution Time */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.avgExecutionTime}s</div>
          <div className="text-sm text-muted-foreground">Average execution time</div>
          
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium">Top Performing Flows</div>
            <div className="flex flex-wrap gap-1">
              {metrics.topPerformingFlows.map((flowId) => (
                <Badge key={flowId} variant="secondary" className="text-xs">
                  {flowId}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problem Flows */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Attention Needed</CardTitle>
          <AlertTriangle className="h-4 w-4 text-status-disconnected" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-status-disconnected">
            {metrics.problemFlows.length}
          </div>
          <div className="text-sm text-muted-foreground">Flows need attention</div>
          
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium">Problem Flows</div>
            <div className="flex flex-wrap gap-1">
              {metrics.problemFlows.map((flowId) => (
                <Badge key={flowId} variant="destructive" className="text-xs">
                  {flowId}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
