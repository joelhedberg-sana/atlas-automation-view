import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Connector, getConnectorIcon } from "@/lib/mock-data";
import { Clock } from "lucide-react";

interface ConnectorCardProps {
  connector: Connector;
}

export function ConnectorCard({ connector }: ConnectorCardProps) {
  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return "Never";
    const date = new Date(lastSync);
    return date.toLocaleString();
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <span className="text-2xl">{getConnectorIcon(connector.id)}</span>
          <span className="text-lg">{connector.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge 
            variant={connector.status === "connected" ? "default" : "destructive"}
            className={
              connector.status === "connected" 
                ? "bg-status-connected text-status-connected-foreground hover:bg-status-connected/80" 
                : "bg-status-disconnected text-status-disconnected-foreground hover:bg-status-disconnected/80"
            }
          >
            {connector.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last sync: {formatLastSync(connector.lastSync)}</span>
        </div>
      </CardContent>
    </Card>
  );
}