
import { useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import GraphNode from "@/components/GraphNode";
import { Navigation } from "@/components/Navigation";
import { EnhancedFlow } from "@/lib/enhanced-data-types";
import { enhancedMockFlows } from "@/lib/enhanced-mock-data";
import { toast } from "@/hooks/use-toast";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Clock, DollarSign, User, Activity } from "lucide-react";
import { CanvasToolbar } from "@/components/canvas/CanvasToolbar";
import { FlowComments } from "@/components/canvas/FlowComments";
import { ChangeHistory } from "@/components/canvas/ChangeHistory";
import { ApprovalWorkflow } from "@/components/canvas/ApprovalWorkflow";
import { useCollaboration } from "@/hooks/useCollaboration";

const nodeTypes = {
  flowNode: GraphNode,
};

const Canvas = () => {
  const [flows, setFlows] = useState<EnhancedFlow[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedFlow, setSelectedFlow] = useState<EnhancedFlow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Enhanced Canvas State
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    departments: [] as string[],
    tools: [] as string[],
    status: [] as string[],
  });
  const [selectedFlows, setSelectedFlows] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<string | null>(null);
  
  // Collaboration hooks
  const collaboration = useCollaboration(selectedFlow?.id || "");

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use enhanced mock data
        const flowsData = enhancedMockFlows;
        setFlows(flowsData);
        
        // Create nodes from enhanced flows
        const flowNodes: Node[] = flowsData.map((flow: EnhancedFlow, index: number) => ({
          id: flow.id,
          type: 'flowNode',
          position: { x: 100 + index * 350, y: 100 + (index % 2) * 200 },
          data: {
            ...flow,
            onClick: () => {
              setSelectedFlow(flow);
              setDrawerOpen(true);
            },
          },
        }));

        // Create edges for duplicates and dependencies
        const flowEdges: Edge[] = flowsData
          .filter((flow: EnhancedFlow) => flow.duplicateOf)
          .map((flow: EnhancedFlow) => ({
            id: `${flow.id}-${flow.duplicateOf}`,
            source: flow.id,
            target: flow.duplicateOf!,
            type: 'smoothstep',
            animated: true,
            style: { stroke: 'hsl(var(--status-duplicate))' },
            label: 'duplicate',
            labelStyle: { fill: 'hsl(var(--status-duplicate))', fontSize: 12 },
          }));

        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (error) {
        console.error('Error fetching flows:', error);
        toast({
          title: "Error",
          description: "Failed to load automation flows for canvas.",
          variant: "destructive",
        });
      }
    };

    fetchFlows();
  }, [setNodes, setEdges]);

  const nodeColor = useCallback((node: Node) => {
    const flow = node.data as unknown as EnhancedFlow;
    if (flow?.duplicateOf) return '#fbbf24'; // amber
    if (flow?.orphan) return '#ef4444'; // red
    if (typeof flow?.successRate === 'number' && flow.successRate < 90) return '#f97316'; // orange
    return '#64748b'; // slate
  }, []);

  const getStatusBadges = (flow: EnhancedFlow) => {
    const badges = [];
    if (flow.duplicateOf) {
      badges.push(
        <Badge key="duplicate" className="bg-status-duplicate text-status-duplicate-foreground">
          Duplicate
        </Badge>
      );
    }
    if (flow.orphan) {
      badges.push(
        <Badge key="orphan" className="bg-status-orphan text-status-orphan-foreground">
          Orphan
        </Badge>
      );
    }
    if (flow.successRate < 90) {
      badges.push(
        <Badge key="low-success" variant="destructive">
          Low Success Rate
        </Badge>
      );
    }
    return badges;
  };

  // Enhanced filtering logic
  const filteredFlows = flows.filter(flow => {
    const matchesSearch = !searchTerm || 
      flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.tool.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filters.departments.length === 0 || 
      filters.departments.includes(flow.department);
    
    const matchesTool = filters.tools.length === 0 || 
      filters.tools.includes(flow.tool);
    
    const matchesStatus = filters.status.length === 0 || (
      (filters.status.includes('duplicate') && flow.duplicateOf) ||
      (filters.status.includes('orphan') && flow.orphan) ||
      (filters.status.includes('active') && !flow.duplicateOf && !flow.orphan) ||
      (filters.status.includes('inactive') && flow.successRate < 50)
    );
    
    return matchesSearch && matchesDepartment && matchesTool && matchesStatus;
  });

  // Bulk operations
  const handleBulkAction = useCallback((action: string) => {
    switch (action) {
      case 'enable':
        toast({ title: "Flows Enabled", description: `${selectedFlows.length} flows have been enabled.` });
        break;
      case 'disable':
        toast({ title: "Flows Disabled", description: `${selectedFlows.length} flows have been disabled.` });
        break;
      case 'duplicate':
        toast({ title: "Flows Duplicated", description: `${selectedFlows.length} flows have been duplicated.` });
        break;
      case 'export':
        toast({ title: "Export Started", description: `Exporting ${selectedFlows.length} flows...` });
        break;
      case 'delete':
        toast({ title: "Flows Deleted", description: `${selectedFlows.length} flows have been deleted.`, variant: "destructive" });
        break;
    }
    setSelectedFlows([]);
    collaboration.addChangeRecord(action, `Bulk ${action} performed on ${selectedFlows.length} flows`);
  }, [selectedFlows, collaboration]);

  const handleCreateFlow = useCallback(() => {
    toast({ title: "Create Flow", description: "Flow builder will open here in the full implementation." });
  }, []);

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      <Navigation />
      
      {/* Enhanced Toolbar */}
      <CanvasToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
        selectedFlows={selectedFlows}
        onBulkAction={handleBulkAction}
        onCreateFlow={handleCreateFlow}
      />
      
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 bg-card border rounded-lg p-4 shadow-lg">
          <h1 className="text-lg font-semibold text-foreground">Enhanced Canvas</h1>
          <p className="text-sm text-muted-foreground">
            {filteredFlows.length} of {flows.length} flows displayed
          </p>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
        >
          <Background gap={20} size={1} />
          <Controls className="bg-card border" />
          <MiniMap 
            nodeColor={nodeColor}
            className="bg-card border"
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>

        {/* Enhanced Flow Details Drawer with Collaboration Features */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="h-[90vh]">
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-3">
                {selectedFlow && (
                  <>
                    <span>Flow Details: {selectedFlow.name}</span>
                    <div className="flex gap-2">
                      {getStatusBadges(selectedFlow)}
                    </div>
                  </>
                )}
              </DrawerTitle>
            </DrawerHeader>
            
            {selectedFlow && (
              <div className="p-6 space-y-6 overflow-y-auto">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="approval">Approval</TabsTrigger>
                    <TabsTrigger value="raw">Raw Data</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Performance
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedFlow.successRate}%</div>
                          <Progress value={selectedFlow.successRate} className="h-2 mt-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {selectedFlow.totalExecutions} total executions
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Execution Time
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedFlow.avgExecutionTime}s</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Average response time
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Monthly Cost
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">${selectedFlow.cost.monthly}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            ${selectedFlow.cost.perExecution} per execution
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Flow Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Flow ID</h4>
                            <p className="text-sm">{selectedFlow.id}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Tool</h4>
                            <p className="text-sm capitalize">{selectedFlow.tool}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Department</h4>
                            <p className="text-sm capitalize">{selectedFlow.department}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Business Value</h4>
                            <Badge variant={selectedFlow.businessValue === 'high' ? 'default' : 'secondary'}>
                              {selectedFlow.businessValue}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Owner</h4>
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-3 w-3" />
                              {selectedFlow.owner}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Execution Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Frequency</h4>
                            <p className="text-sm capitalize">{selectedFlow.frequency}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Last Run</h4>
                            <p className="text-sm">
                              {selectedFlow.lastRun 
                                ? new Date(selectedFlow.lastRun).toLocaleString()
                                : 'Never'
                              }
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Monthly Executions</h4>
                            <p className="text-sm">{selectedFlow.monthlyExecutions}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Error Count</h4>
                            <p className="text-sm text-status-disconnected">{selectedFlow.performance.errorCount}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Configuration */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Configuration</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Trigger</h4>
                          <Badge variant="outline">{selectedFlow.trigger.type}</Badge>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">Actions ({selectedFlow.actions.length})</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedFlow.actions.map((action) => (
                              <Badge key={action.id} variant="secondary">
                                {action.type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="comments">
                    <FlowComments
                      flowId={selectedFlow.id}
                      comments={collaboration.comments}
                      onAddComment={collaboration.addComment}
                    />
                  </TabsContent>

                  <TabsContent value="history">
                    <ChangeHistory
                      flowId={selectedFlow.id}
                      changes={collaboration.changeHistory}
                    />
                  </TabsContent>

                  <TabsContent value="approval">
                    <ApprovalWorkflow
                      flowId={selectedFlow.id}
                      currentUser={collaboration.currentUser}
                      approvalRequest={collaboration.approvalRequest}
                      onApprove={collaboration.approveRequest}
                      onReject={collaboration.rejectRequest}
                      onRequestApproval={collaboration.requestApproval}
                    />
                  </TabsContent>

                  <TabsContent value="raw">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Raw Data (Development)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-xs overflow-auto max-h-96 bg-muted p-4 rounded">
                          {JSON.stringify(selectedFlow, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default Canvas;
