import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, ArrowRight } from 'lucide-react';
import { OnboardingData } from '../OnboardingWizard';

interface OnboardingCompleteStepProps {
  data: OnboardingData;
  onComplete: () => void;
}

export function OnboardingCompleteStep({ data, onComplete }: OnboardingCompleteStepProps) {
  const connectedPlatforms = Object.entries(data.connections)
    .filter(([_, connected]) => connected)
    .map(([platform]) => platform);

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-green-600">
          Welcome aboard, {data.profile.firstName}!
        </h2>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          You're all set! Your Automation Atlas is ready to help you discover 
          and manage your automation workflows.
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold">What's next?</h3>
        <div className="space-y-3 text-sm text-left">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Profile completed for {data.profile.organizationName}</span>
          </div>
          
          {connectedPlatforms.length > 0 ? (
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>
                Connected {connectedPlatforms.length} platform{connectedPlatforms.length > 1 ? 's' : ''}: {' '}
                {connectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>You can connect platforms from your dashboard</span>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Ready to explore your automation dashboard</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button onClick={onComplete} size="lg" className="w-full">
          Go to Dashboard
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        
        <p className="text-xs text-muted-foreground">
          Need help? Check out our documentation or contact support.
        </p>
      </div>
    </div>
  );
}