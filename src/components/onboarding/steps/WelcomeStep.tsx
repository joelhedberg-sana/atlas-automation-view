import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Users } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const features = [
    {
      icon: Zap,
      title: 'Connect All Your Tools',
      description: 'Integrate Zapier, HubSpot, Lemlist and more in one place',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security for your automation data',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share insights and manage automations as a team',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
          <Zap className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold">
          Welcome to Automation Atlas
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your centralized platform for discovering, managing, and optimizing 
          all your company's automation workflows.
        </p>
      </div>

      <div className="grid gap-4 mt-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={onNext} size="lg">
          Get Started
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}