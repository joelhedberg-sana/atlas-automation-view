import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Flow, getConnectorIcon, getFlowStatusColor } from "@/lib/mock-data";

interface GraphNodeData extends Flow {
  onClick?: () => void;
}

interface GraphNodeProps {
  data: GraphNodeData;
}

function GraphNode({ data }: GraphNodeProps) {
  const statusColor = getFlowStatusColor(data);
  
  const nodeColors = {
    duplicate: "border-status-duplicate bg-status-duplicate/10",
    orphan: "border-status-orphan bg-status-orphan/10",
    normal: "border-status-normal bg-status-normal/10"
  };

  const handleClick = () => {
    if (data.onClick) {
      data.onClick();
    }
  };

  return (
    <div 
      className={`
        px-4 py-3 rounded-lg border-2 bg-card cursor-pointer 
        transition-all hover:shadow-md min-w-[200px] max-w-[280px]
        ${nodeColors[statusColor]}
      `}
      onClick={handleClick}
    >
      {/* Target handle for incoming connections */}
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getConnectorIcon(data.tool)}</span>
          <span className="font-semibold text-sm text-card-foreground">{data.name}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{data.summary}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {data.tool}
          </span>
          {data.duplicateOf && (
            <span className="text-xs text-status-duplicate">Duplicate</span>
          )}
          {data.orphan && (
            <span className="text-xs text-status-orphan">Orphan</span>
          )}
        </div>
      </div>
      
      {/* Source handle for outgoing connections */}
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
}

export default memo(GraphNode);