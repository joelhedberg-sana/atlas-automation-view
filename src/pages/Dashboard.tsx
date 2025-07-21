import { useState, useEffect } from "react";
import { ConnectorCard } from "@/components/ConnectorCard";
import { FlowTable } from "@/components/FlowTable";
import { Navigation } from "@/components/Navigation";
import { Connector, Flow, mockConnectors, mockFlows } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay for demo
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Use mock data directly for now
        setConnectors(mockConnectors);
        setFlows(mockFlows);
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
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>

          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-64 w-full" />
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
              Visualize and manage all your company automations in one place
            </p>
          </div>

          {/* Connector Cards */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Connected Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connectors.map((connector) => (
                <ConnectorCard key={connector.id} connector={connector} />
              ))}
            </div>
          </div>

          {/* Flow Table */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Automation Flows</h2>
            <FlowTable flows={flows} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;