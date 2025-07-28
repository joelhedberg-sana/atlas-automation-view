import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { WelcomeStep } from './steps/WelcomeStep';
import { ProfileSetupStep } from './steps/ProfileSetupStep';
import { PlatformConnectionStep } from './steps/PlatformConnectionStep';
import { OnboardingCompleteStep } from './steps/OnboardingCompleteStep';
import { DemoDataStep } from './DemoDataStep';

export interface OnboardingData {
  profile: {
    firstName: string;
    lastName: string;
    organizationName: string;
    department: string;
  };
  connections: {
    zapier: boolean;
    hubspot: boolean;
    lemlist: boolean;
  };
}

const STEPS = [
  { id: 'welcome', title: 'Welcome', description: 'Welcome to Automation Atlas' },
  { id: 'profile', title: 'Profile Setup', description: 'Set up your profile' },
  { id: 'connections', title: 'Connect Platforms', description: 'Connect your automation tools' },
  { id: 'demo', title: 'Preview', description: 'See your future dashboard' },
  { id: 'complete', title: 'Complete', description: 'You\'re all set!' },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    profile: {
      firstName: '',
      lastName: '',
      organizationName: '',
      department: '',
    },
    connections: {
      zapier: false,
      hubspot: false,
      lemlist: false,
    },
  });

  const currentStepData = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepComplete = (stepData: any) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));
    handleNext();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;
      case 1:
        return (
          <ProfileSetupStep 
            data={onboardingData.profile} 
            onComplete={handleStepComplete}
          />
        );
      case 2:
        return (
          <PlatformConnectionStep 
            data={onboardingData.connections} 
            onComplete={handleStepComplete}
          />
        );
      case 3:
        return <DemoDataStep onComplete={handleNext} />;
      case 4:
        return (
          <OnboardingCompleteStep 
            data={onboardingData} 
            onComplete={onComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Getting Started</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                  ${completedSteps.includes(index) ? 'bg-green-500' : ''}
                `}>
                  {completedSteps.includes(index) ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`
                    w-12 h-0.5 mx-2
                    ${index < currentStep ? 'bg-primary' : 'bg-muted'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}
            
            {/* Navigation */}
            {currentStep > 0 && currentStep < STEPS.length - 2 && (
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button variant="ghost" onClick={() => setCurrentStep(STEPS.length - 1)}>
                  Skip to end
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}