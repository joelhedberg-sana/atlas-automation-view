import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConnectionTestProps {
  platform: string;
  connectionData: any;
  onTestComplete: (success: boolean) => void;
}

export function ConnectionTest({ platform, connectionData, onTestComplete }: ConnectionTestProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const testConnection = async () => {
    setIsTesting(true);
    setTestProgress(0);
    setTestResult(null);
    setErrorMessage('');

    try {
      // Simulate progressive testing steps
      const steps = [
        { message: 'Validating credentials...', progress: 25 },
        { message: 'Establishing connection...', progress: 50 },
        { message: 'Testing API access...', progress: 75 },
        { message: 'Verifying permissions...', progress: 100 },
      ];

      for (const step of steps) {
        setTestProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Call the appropriate edge function to test the connection
      const { data, error } = await supabase.functions.invoke(`${platform}-integration`, {
        body: {
          action: 'test',
          ...connectionData,
        },
      });

      if (error) throw error;

      setTestResult('success');
      onTestComplete(true);
      
      toast({
        title: "Connection successful!",
        description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} is now connected and ready to use.`,
      });
    } catch (error: any) {
      setTestResult('error');
      setErrorMessage(error.message || 'Connection test failed');
      onTestComplete(false);
      
      toast({
        title: "Connection failed",
        description: error.message || `Failed to connect to ${platform}. Please check your credentials.`,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (testResult === 'success') {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          ✅ Connection test passed! Your {platform} account is properly connected.
        </AlertDescription>
      </Alert>
    );
  }

  if (testResult === 'error') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          ❌ Connection test failed: {errorMessage}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={testConnection}
            className="ml-2 h-auto p-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {isTesting ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Testing connection...</span>
          </div>
          <Progress value={testProgress} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {testProgress === 25 && 'Validating credentials...'}
            {testProgress === 50 && 'Establishing connection...'}
            {testProgress === 75 && 'Testing API access...'}
            {testProgress === 100 && 'Verifying permissions...'}
          </div>
        </div>
      ) : (
        <Button onClick={testConnection} variant="outline" className="w-full">
          Test Connection
        </Button>
      )}
    </div>
  );
}