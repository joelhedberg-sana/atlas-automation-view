import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Navigation } from "@/components/Navigation";
import { Flow, getConnectorIcon, mockFlows } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, Clock } from "lucide-react";

const Issues = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [timelineValue, setTimelineValue] = useState([21]); // July 21, 2025
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Use mock data directly
        setFlows(mockFlows);
      } catch (error) {
        console.error('Error fetching flows:', error);
        toast({
          title: "Error",
          description: "Failed to load automation issues.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFlows();
  }, []);

  const duplicateFlows = flows.filter(flow => flow.duplicateOf);
  const orphanFlows = flows.filter(flow => flow.orphan);

  const formatTimelineDate = (day: number) => {
    const date = new Date(2025, 6, day); // July 2025
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const FlowCard = ({ flow, issueType }: { flow: Flow; issueType: 'duplicate' | 'orphan' }) => (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">{getConnectorIcon(flow.tool)}</span>
            <span className="text-base">{flow.name}</span>
          </div>
          <Badge 
            className={
              issueType === 'duplicate' 
                ? "bg-status-duplicate text-status-duplicate-foreground" 
                : "bg-status-orphan text-status-orphan-foreground"
            }
          >
            {issueType === 'duplicate' ? 'Duplicate' : 'Orphan'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{flow.summary}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {flow.tool}
          </span>
          {issueType === 'duplicate' && flow.duplicateOf && (
            <span className="text-xs text-muted-foreground">
              Duplicates: {flow.duplicateOf}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-40 bg-muted rounded"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
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
        <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            Automation Issues
          </h1>
          <p className="text-muted-foreground mt-2">
            Identify and resolve duplicate flows and orphaned automations
          </p>
        </div>

        {/* Timeline Slider */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline View
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>July 1, 2025</span>
                <span className="font-medium">
                  Selected: {formatTimelineDate(timelineValue[0])}
                </span>
                <span>July 21, 2025</span>
              </div>
              <Slider
                value={timelineValue}
                onValueChange={setTimelineValue}
                max={21}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Use this timeline to see when issues occurred. Showing data up to {formatTimelineDate(timelineValue[0])}.
            </p>
          </CardContent>
        </Card>

        {/* Issues Tabs */}
        <Tabs defaultValue="duplicates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="duplicates" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Duplicates ({duplicateFlows.length})
            </TabsTrigger>
            <TabsTrigger value="orphans" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Orphans ({orphanFlows.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="duplicates" className="space-y-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Duplicate Flows</h2>
              {duplicateFlows.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {duplicateFlows.map((flow) => (
                    <FlowCard key={flow.id} flow={flow} issueType="duplicate" />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">No duplicate flows found.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="orphans" className="space-y-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Orphaned Flows</h2>
              {orphanFlows.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orphanFlows.map((flow) => (
                    <FlowCard key={flow.id} flow={flow} issueType="orphan" />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">No orphaned flows found.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Issues;