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
import { Flow, mockFlows } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";

const nodeTypes = {
  flowNode: GraphNode,
};

const Canvas = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use mock data directly
        const flowsData = mockFlows;
        setFlows(flowsData);
        
        // Create nodes from flows
        const flowNodes: Node[] = flowsData.map((flow: Flow, index: number) => ({
          id: flow.id,
          type: 'flowNode',
          position: { x: 100 + index * 300, y: 100 },
          data: {
            ...flow,
            onClick: () => {
              setSelectedFlow(flow);
              setDrawerOpen(true);
            },
          },
        }));

        // Create edges for duplicates
        const flowEdges: Edge[] = flowsData
          .filter((flow: Flow) => flow.duplicateOf)
          .map((flow: Flow) => ({
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
    const flow = node.data;
    if (flow?.duplicateOf) return '#fbbf24'; // amber
    if (flow?.orphan) return '#ef4444'; // red
    return '#64748b'; // slate
  }, []);

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      <Navigation />
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 bg-card border rounded-lg p-4 shadow-lg">
          <h1 className="text-lg font-semibold text-foreground">Automation Flow Canvas</h1>
          <p className="text-sm text-muted-foreground">
            Interactive view of all automation flows and their relationships
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

      {/* Flow Details Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="h-[80vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-3">
              {selectedFlow && (
                <>
                  <span>Flow Details: {selectedFlow.name}</span>
                  {selectedFlow.duplicateOf && (
                    <Badge className="bg-status-duplicate text-status-duplicate-foreground">
                      Duplicate
                    </Badge>
                  )}
                  {selectedFlow.orphan && (
                    <Badge className="bg-status-orphan text-status-orphan-foreground">
                      Orphan
                    </Badge>
                  )}
                </>
              )}
            </DrawerTitle>
          </DrawerHeader>
          
          {selectedFlow && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Flow ID</h3>
                  <p className="text-sm">{selectedFlow.id}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Tool</h3>
                  <p className="text-sm capitalize">{selectedFlow.tool}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Summary</h3>
                  <p className="text-sm">{selectedFlow.summary}</p>
                </div>
                {selectedFlow.duplicateOf && (
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-sm text-muted-foreground">Duplicate Of</h3>
                    <p className="text-sm">{selectedFlow.duplicateOf}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-sm mb-2">Raw JSON Data</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(selectedFlow, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
      </div>
    </div>
  );
};

export default Canvas;