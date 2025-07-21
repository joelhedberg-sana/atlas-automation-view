import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  AlertTriangle, 
  Copy, 
  DollarSign,
  Clock,
  Target,
  Users,
  BarChart3,
  Zap,
  AlertCircle
} from "lucide-react";
import { AutomationAnalytics, BusinessImpactCalculator } from "@/lib/analytics-engine";
import { EnhancedFlow } from "@/lib/enhanced-data-types";
import { enhancedMockFlows } from "@/lib/enhanced-mock-data";

const AdvancedAnalyticsDashboard = () => {
  const [flows, setFlows] = useState<EnhancedFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFlows(enhancedMockFlows);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-2 w-full bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Generate analytics insights
  const duplicates = AutomationAnalytics.detectAdvancedDuplicates(flows);
  const orphans = AutomationAnalytics.detectOrphans(flows);
  const anomalies = AutomationAnalytics.detectPerformanceAnomalies(flows);
  
  // Department efficiency
  const salesEfficiency = BusinessImpactCalculator.calculateDepartmentEfficiency(flows, 'sales');
  const marketingEfficiency = BusinessImpactCalculator.calculateDepartmentEfficiency(flows, 'marketing');
  
  // Revenue attribution
  const revenueAttribution = BusinessImpactCalculator.calculateRevenueAttribution(flows);
  
  // Overall ROI calculations
  const totalROI = flows.reduce((sum, flow) => {
    const roi = AutomationAnalytics.calculateROI(flow);
    return sum + roi.monthlySavings;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Copy className="h-4 w-4 text-status-duplicate" />
              Duplicates Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-duplicate">
              {duplicates.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Potential savings: ${(duplicates.length * 15.6).toFixed(0)}/mo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-status-orphan" />
              Orphaned Flows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-orphan">
              {orphans.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {orphans.filter(o => o.severity === 'high').length} high severity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              Monthly Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ${totalROI.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From automation efficiency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-600" />
              Performance Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {anomalies.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {anomalies.filter(a => a.impact === 'high').length} require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Tabs */}
      <Tabs defaultValue="duplicates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="duplicates">Smart Duplicates</TabsTrigger>
          <TabsTrigger value="performance">Performance Issues</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
          <TabsTrigger value="departments">Department Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="duplicates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                Advanced Duplicate Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {duplicates.length === 0 ? (
                <p className="text-muted-foreground">No duplicates detected using advanced similarity analysis.</p>
              ) : (
                duplicates.map((duplicate, index) => (
                  <Alert key={index}>
                    <Copy className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <strong>{duplicate.flow.name}</strong>
                          <Badge variant="secondary">
                            {Math.round(duplicate.similarity * 100)}% similarity
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{duplicate.reason}</p>
                        <div className="flex flex-wrap gap-2">
                          {duplicate.duplicates.map(dup => (
                            <Badge key={dup.id} variant="outline">
                              {dup.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Anomalies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {anomalies.map((anomaly, index) => (
                <Alert key={index} variant={anomaly.impact === 'high' ? 'destructive' : 'default'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <strong>{anomaly.flow.name}</strong>
                        <Badge variant={
                          anomaly.impact === 'high' ? 'destructive' : 
                          anomaly.impact === 'medium' ? 'default' : 'secondary'
                        }>
                          {anomaly.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm">{anomaly.anomaly}</p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Recommendation:</strong> {anomaly.recommendation}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flows.map(flow => {
              const roi = AutomationAnalytics.calculateROI(flow);
              return (
                <Card key={flow.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{flow.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Savings</p>
                        <p className="text-lg font-semibold text-emerald-600">
                          ${roi.monthlySavings.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ROI</p>
                        <p className={`text-lg font-semibold ${roi.roi > 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {roi.roi.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payback Period</p>
                      <p className="text-sm">
                        {roi.paybackPeriod.toFixed(1)} months
                      </p>
                    </div>
                    <Progress value={Math.min(roi.roi, 100)} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Sales Department
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Flows</p>
                    <p className="text-2xl font-bold">{salesEfficiency.activeFlows}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{salesEfficiency.averageSuccessRate.toFixed(1)}%</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Savings</p>
                  <p className="text-lg font-semibold text-emerald-600">
                    ${salesEfficiency.totalMonthlySavings.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Automation Coverage</p>
                  <Progress value={salesEfficiency.automationCoverage} className="h-2 mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {salesEfficiency.automationCoverage.toFixed(0)}% of processes automated
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Marketing Department
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Flows</p>
                    <p className="text-2xl font-bold">{marketingEfficiency.activeFlows}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{marketingEfficiency.averageSuccessRate.toFixed(1)}%</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Savings</p>
                  <p className="text-lg font-semibold text-emerald-600">
                    ${marketingEfficiency.totalMonthlySavings.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Automation Coverage</p>
                  <Progress value={marketingEfficiency.automationCoverage} className="h-2 mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {marketingEfficiency.automationCoverage.toFixed(0)}% of processes automated
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Attribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Attribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {revenueAttribution.slice(0, 3).map((item, index) => (
                  <div key={item.flow.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.flow.name}</p>
                      <p className="text-sm text-muted-foreground">
                        +{item.conversionImpact}% conversion impact
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">
                        ${item.estimatedMonthlyRevenue.toLocaleString()}/mo
                      </p>
                      <p className="text-xs text-muted-foreground">estimated revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;