import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Platform {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface PlatformConnectionModalProps {
  platform: Platform;
  onSuccess: () => void;
  onClose: () => void;
}

export function PlatformConnectionModal({ platform, onSuccess, onClose }: PlatformConnectionModalProps) {
  const [connectionData, setConnectionData] = useState({
    apiKey: '',
    webhookUrl: '',
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<'oauth' | 'api'>('oauth');
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would call the appropriate edge function here
      const { data, error } = await supabase.functions.invoke(`${platform.id}-integration`, {
        body: {
          action: 'connect',
          ...connectionData,
        },
      });

      if (error) throw error;

      toast({
        title: "Connection successful!",
        description: `${platform.name} has been connected to your account.`,
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || `Failed to connect to ${platform.name}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const getConnectionInstructions = () => {
    switch (platform.id) {
      case 'zapier':
        return {
          title: 'Connect Zapier Account',
          description: 'You can connect via API key or webhook URL',
          fields: [
            { key: 'webhookUrl', label: 'Webhook URL', placeholder: 'https://hooks.zapier.com/hooks/catch/...' }
          ],
          helpText: 'Create a webhook in Zapier and paste the URL here to trigger your zaps.',
        };
      case 'hubspot':
        return {
          title: 'Connect HubSpot Account',
          description: 'Connect using OAuth for secure access',
          fields: [],
          helpText: 'We\'ll redirect you to HubSpot to authorize access to your workflows.',
        };
      case 'lemlist':
        return {
          title: 'Connect Lemlist Account',
          description: 'Enter your Lemlist API key',
          fields: [
            { key: 'apiKey', label: 'API Key', placeholder: 'Your Lemlist API key' }
          ],
          helpText: 'Find your API key in your Lemlist account settings.',
        };
      default:
        return {
          title: `Connect ${platform.name}`,
          description: 'Follow the instructions to connect your account',
          fields: [],
          helpText: '',
        };
    }
  };

  const instructions = getConnectionInstructions();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${platform.color} flex items-center justify-center text-white`}>
              <span>{platform.icon}</span>
            </div>
            {instructions.title}
          </DialogTitle>
          <DialogDescription>{instructions.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {platform.id === 'hubspot' ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Click the button below to securely connect your HubSpot account using OAuth.
                </AlertDescription>
              </Alert>
              
              <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
                {isConnecting ? 'Connecting...' : 'Connect with OAuth'}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {instructions.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    value={connectionData[field.key as keyof typeof connectionData]}
                    onChange={(e) => setConnectionData(prev => ({ 
                      ...prev, 
                      [field.key]: e.target.value 
                    }))}
                    placeholder={field.placeholder}
                    type={field.key === 'apiKey' ? 'password' : 'text'}
                  />
                </div>
              ))}

              {instructions.helpText && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{instructions.helpText}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting || !connectionData.apiKey && !connectionData.webhookUrl} 
                  className="flex-1"
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}