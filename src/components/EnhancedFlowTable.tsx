
import { EnhancedFlow } from "@/lib/enhanced-data-types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, TrendingUp, Clock, DollarSign, User } from "lucide-react";
import { getConnectorIcon } from "@/lib/mock-data";

interface EnhancedFlowTableProps {
  flows: EnhancedFlow[];
}

export function EnhancedFlowTable({ flows }: EnhancedFlowTableProps) {
  const getStatusBadge = (flow: EnhancedFlow) => {
    if (flow.duplicateOf) {
      return <Badge className="bg-status-duplicate text-status-duplicate-foreground">Duplicate</Badge>;
    }
    if (flow.orphan) {
      return <Badge className="bg-status-orphan text-status-orphan-foreground">Orphan</Badge>;
    }
    if (flow.successRate < 90) {
      return <Badge variant="destructive">Low Success Rate</Badge>;
    }
    if (flow.successRate >= 98) {
      return <Badge className="bg-status-connected text-status-connected-foreground">Excellent</Badge>;
    }
    return <Badge variant="secondary">Active</Badge>;
  };

  const getBusinessValueBadge = (value: string) => {
    const variants = {
      high: "default",
      medium: "secondary", 
      low: "outline"
    } as const;
    return <Badge variant={variants[value as keyof typeof variants]}>{value}</Badge>;
  };

  const getDepartmentColor = (dept: string) => {
    const colors = {
      sales: "text-blue-600",
      marketing: "text-green-600",
      support: "text-purple-600",
      operations: "text-orange-600"
    } as const;
    return colors[dept as keyof typeof colors] || "text-gray-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automation Flows</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flow Name</TableHead>
              <TableHead>Tool</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Business Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flows.map((flow) => (
              <TableRow key={flow.id} className="group">
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{flow.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {flow.summary}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{flow.owner.split('@')[0]}</span>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getConnectorIcon(flow.tool)}</span>
                    <span className="capitalize text-sm">{flow.tool}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <span className={`capitalize font-medium ${getDepartmentColor(flow.department)}`}>
                    {flow.department}
                  </span>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Progress value={flow.successRate} className="h-2 w-16" />
                      <span className="text-sm font-medium">{flow.successRate}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{flow.avgExecutionTime}s avg</span>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">${flow.cost.monthly}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${flow.cost.perExecution}/run
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  {getBusinessValueBadge(flow.businessValue)}
                </TableCell>
                
                <TableCell>
                  {getStatusBadge(flow)}
                </TableCell>
                
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
