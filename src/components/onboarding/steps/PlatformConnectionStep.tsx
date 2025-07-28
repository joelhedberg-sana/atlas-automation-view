import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, ExternalLink, Zap } from 'lucide-react';
import { PlatformConnectionModal } from '../PlatformConnectionModal';

interface ConnectionData {
  zapier: boolean;
  hubspot: boolean;
  lemlist: boolean;
}

interface PlatformConnectionStepProps {
  data: ConnectionData;
  onComplete: (data: { connections: ConnectionData }) => void;
}

const platforms = [
  {
    id: 'zapier' as keyof ConnectionData,
    name: 'Zapier',
    description: 'Connect your Zapier automations',
    color: 'bg-orange-500',
    icon: '⚡',
    recommended: true,
  },
  {
    id: 'hubspot' as keyof ConnectionData,
    name: 'HubSpot',
    description: 'Sync your HubSpot workflows',
    color: 'bg-orange-600',
    icon: '🟠',
    recommended: true,
  },
  {
    id: 'lemlist' as keyof ConnectionData,
    name: 'Lemlist',
    description: 'Import your Lemlist campaigns',
    color: 'bg-blue-500',
    icon: '📧',
    recommended: false,
  },
];

export function PlatformConnectionStep({ data, onComplete }: PlatformConnectionStepProps) {
  const [connections, setConnections] = useState<ConnectionData>(data);
  const [selectedPlatform, setSelectedPlatform] = useState<keyof ConnectionData | null>(null);

  const handleConnectionSuccess = (platformId: keyof ConnectionData) => {
    setConnections(prev => ({ ...prev, [platformId]: true }));
    setSelectedPlatform(null);
  };

  const handleContinue = () => {
    onComplete({ connections });
  };

  const connectedCount = Object.values(connections).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Connect Your Automation Platforms</h3>
        <p className="text-muted-foreground">
          Connect your automation tools to start discovering your workflows. 
          You can always add more connections later.
        </p>
      </div>

      <div className="grid gap-4">
        {platforms.map((platform) => {
          const isConnected = connections[platform.id];
          
          return (
            <Card key={platform.id} className={`cursor-pointer transition-all hover:shadow-md ${
              isConnected ? 'ring-2 ring-green-500' : ''
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center text-white`}>
                      <span className="text-lg">{platform.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{platform.name}</CardTitle>
                        {platform.recommended && (
                          <Badge variant="secondary" className="text-xs">Recommended</Badge>
                        )}
                      </div>
                      <CardDescription>{platform.description}</CardDescription>
                    </div>
                  </div>
                  
                  {isConnected ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPlatform(platform.id)}
                    >
                      Connect
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {connectedCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              Great! You've connected {connectedCount} platform{connectedCount > 1 ? 's' : ''}.
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            You can add more connections anytime from your dashboard.
          </p>
        </div>
      )}

      <div className="flex justify-between items-center pt-4">
        <Button variant="ghost" onClick={handleContinue}>
          Skip for now
        </Button>
        <Button onClick={handleContinue} disabled={connectedCount === 0}>
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Connection Modal */}
      {selectedPlatform && (
        <PlatformConnectionModal
          platform={platforms.find(p => p.id === selectedPlatform)!}
          onSuccess={() => handleConnectionSuccess(selectedPlatform)}
          onClose={() => setSelectedPlatform(null)}
        />
      )}
    </div>
  );
}