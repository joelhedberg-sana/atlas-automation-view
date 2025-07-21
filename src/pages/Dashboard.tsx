
import { useState, useEffect } from "react";
import { EnhancedConnectorCard } from "@/components/EnhancedConnectorCard";
import { EnhancedFlowTable } from "@/components/EnhancedFlowTable";
import { MetricsDashboard } from "@/components/MetricsDashboard";
import { Navigation } from "@/components/Navigation";
import { EnhancedConnector, EnhancedFlow, FlowMetrics } from "@/lib/enhanced-data-types";
import { enhancedMockConnectors, enhancedMockFlows, mockFlowMetrics } from "@/lib/enhanced-mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [connectors, setConnectors] = useState<EnhancedConnector[]>([]);
  const [flows, setFlows] = useState<EnhancedFlow[]>([]);
  const [metrics, setMetrics] = useState<FlowMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay for demo
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Use enhanced mock data
        setConnectors(enhancedMockConnectors);
        setFlows(enhancedMockFlows);
        setMetrics(mockFlowMetrics);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load automation data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            
            {/* Metrics Dashboard Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>

            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Automation Atlas</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive automation management for RevOps teams
            </p>
          </div>

          {/* Metrics Dashboard */}
          {metrics && <MetricsDashboard metrics={metrics} />}

          {/* Connector Cards */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Connected Platforms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {connectors.map((connector) => (
                <EnhancedConnectorCard key={connector.id} connector={connector} />
              ))}
            </div>
          </div>

          {/* Flow Table */}
          <div>
            <EnhancedFlowTable flows={flows} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
