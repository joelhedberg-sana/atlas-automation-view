import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Flow, getConnectorIcon, getFlowStatusColor } from "@/lib/mock-data";

interface FlowTableProps {
  flows: Flow[];
}

export function FlowTable({ flows }: FlowTableProps) {
  const getStatusBadge = (flow: Flow) => {
    const status = getFlowStatusColor(flow);
    const statusLabels = {
      duplicate: "Duplicate",
      orphan: "Orphan", 
      normal: "Active"
    };

    const statusClasses = {
      duplicate: "bg-status-duplicate text-status-duplicate-foreground hover:bg-status-duplicate/80",
      orphan: "bg-status-orphan text-status-orphan-foreground hover:bg-status-orphan/80",
      normal: "bg-status-normal text-status-normal-foreground hover:bg-status-normal/80"
    };

    return (
      <Badge className={statusClasses[status]}>
        {statusLabels[status]}
      </Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Flow Name</TableHead>
            <TableHead>Tool</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flows.map((flow) => (
            <TableRow key={flow.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{flow.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getConnectorIcon(flow.tool)}</span>
                  <span className="capitalize">{flow.tool}</span>
                </div>
              </TableCell>
              <TableCell className="max-w-md truncate text-muted-foreground">
                {flow.summary}
              </TableCell>
              <TableCell>{getStatusBadge(flow)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}