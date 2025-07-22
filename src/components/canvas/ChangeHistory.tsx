import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { History, User, Calendar, GitCommit } from "lucide-react";

interface ChangeRecord {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  user: string;
  userRole: string;
  timestamp: Date;
  description: string;
}

interface ChangeHistoryProps {
  flowId: string;
  changes: ChangeRecord[];
}

export function ChangeHistory({ flowId, changes }: ChangeHistoryProps) {
  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created': return '🟢';
      case 'updated': return '🔵';
      case 'deleted': return '🔴';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '📝';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Change History & Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {changes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No changes recorded yet.
            </p>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border"></div>
              
              {changes.map((change, index) => (
                <div key={change.id} className="relative pl-10 pb-4">
                  {/* Timeline dot */}
                  <div className="absolute left-2.5 w-3 h-3 bg-background border-2 border-primary rounded-full"></div>
                  
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getActionIcon(change.action)}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${getActionColor(change.action)}`}>
                              {change.action}
                            </Badge>
                            {change.field && (
                              <span className="text-xs text-muted-foreground">
                                Field: {change.field}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium mt-1">{change.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {change.timestamp.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <User className="h-3 w-3" />
                          {change.user} ({change.userRole})
                        </div>
                      </div>
                    </div>
                    
                    {/* Value changes */}
                    {change.oldValue && change.newValue && (
                      <div className="text-xs space-y-1 bg-background rounded p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-red-600">- {change.oldValue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">+ {change.newValue}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}