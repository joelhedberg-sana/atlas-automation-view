import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, ExternalLink, Zap, Info, Star } from 'lucide-react';
import { PlatformConnectionModal } from '../PlatformConnectionModal';
import { ConnectionTest } from '../ConnectionTest';

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
    difficulty: 'Easy',
    timeToSetup: '2 min',
    workflows: '5000+',
    benefits: ['Instant workflow discovery', 'Execution tracking', 'Performance insights'],
  },
  {
    id: 'hubspot' as keyof ConnectionData,
    name: 'HubSpot',
    description: 'Sync your HubSpot workflows',
    color: 'bg-orange-600',
    icon: '🟠',
    recommended: true,
    difficulty: 'Easy',
    timeToSetup: '1 min',
    workflows: '200+',
    benefits: ['CRM automation tracking', 'Lead scoring insights', 'Pipeline optimization'],
  },
  {
    id: 'lemlist' as keyof ConnectionData,
    name: 'Lemlist',
    description: 'Import your Lemlist campaigns',
    color: 'bg-blue-500',
    icon: '📧',
    recommended: false,
    difficulty: 'Medium',
    timeToSetup: '3 min',
    workflows: '100+',
    benefits: ['Email campaign tracking', 'Outreach optimization', 'Response analytics'],
  },
];

export function PlatformConnectionStep({ data, onComplete }: PlatformConnectionStepProps) {
  const [connections, setConnections] = useState<ConnectionData>(data);
  const [selectedPlatform, setSelectedPlatform] = useState<keyof ConnectionData | null>(null);
  const [testingConnections, setTestingConnections] = useState<Record<keyof ConnectionData, boolean>>({
    zapier: false,
    hubspot: false,
    lemlist: false,
  });

  const handleConnectionSuccess = (platformId: keyof ConnectionData) => {
    setConnections(prev => ({ ...prev, [platformId]: true }));
    setTestingConnections(prev => ({ ...prev, [platformId]: true }));
    setSelectedPlatform(null);
  };

  const handleContinue = () => {
    onComplete({ connections });
  };

  const handleTestComplete = (platformId: keyof ConnectionData, success: boolean) => {
    setTestingConnections(prev => ({ ...prev, [platformId]: false }));
    if (!success) {
      setConnections(prev => ({ ...prev, [platformId]: false }));
    }
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
          const isRecommended = platform.recommended;
          
          return (
            <Card key={platform.id} className={`transition-all hover:shadow-md ${
              isConnected ? 'ring-2 ring-green-500 bg-green-50/50' : ''
            } ${isRecommended ? 'border-primary/40' : ''}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg ${platform.color} flex items-center justify-center text-white relative`}>
                      <span className="text-lg">{platform.icon}</span>
                      {isRecommended && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Star className="h-3 w-3 text-yellow-900" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">{platform.name}</CardTitle>
                        {isRecommended && (
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mb-2">{platform.description}</CardDescription>
                      
                      {/* Platform Details */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>⏱️ {platform.timeToSetup}</span>
                        <span>📊 {platform.workflows} workflows</span>
                        <span>🎯 {platform.difficulty}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
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
                </div>
                
                {/* Benefits */}
                <div className="mt-3 space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Key Benefits:</div>
                  <div className="grid grid-cols-1 gap-1">
                    {platform.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>
              
              {/* Connection Testing */}
              {isConnected && testingConnections[platform.id] && (
                <CardContent className="pt-0">
                  <ConnectionTest
                    platform={platform.id}
                    connectionData={{}} // Would contain actual connection data
                    onTestComplete={(success) => handleTestComplete(platform.id, success)}
                  />
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {connectedCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium text-green-800">
                Excellent! You've connected {connectedCount} platform{connectedCount > 1 ? 's' : ''}.
              </div>
              <div className="text-sm text-green-700 mt-1">
                Your automation data will start syncing immediately. You can add more connections anytime from your dashboard.
              </div>
              <div className="mt-2 text-xs text-green-600">
                💡 Pro tip: Start with the recommended platforms for the best experience
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <div className="font-medium text-blue-800">What happens next?</div>
            <div className="text-sm text-blue-700 mt-1">
              Once connected, we'll automatically discover your workflows and start providing insights within minutes.
            </div>
          </div>
        </div>
      </div>

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