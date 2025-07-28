import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, X, BarChart3, Network, AlertTriangle, Search, Zap } from 'lucide-react';

interface FeatureTourProps {
  onComplete: () => void;
}

const tourSteps = [
  {
    title: 'Dashboard Analytics',
    description: 'Monitor key metrics across all your automation platforms',
    icon: BarChart3,
    features: [
      'Real-time execution tracking',
      'Cost analysis and optimization',
      'Performance benchmarking',
      'Custom metric dashboards',
    ],
    highlight: 'Get insights into your automation ROI',
  },
  {
    title: 'Visual Canvas',
    description: 'See how your automations connect and interact',
    icon: Network,
    features: [
      'Interactive workflow visualization',
      'Dependency mapping',
      'Impact analysis',
      'Collaboration tools',
    ],
    highlight: 'Understand your automation ecosystem',
  },
  {
    title: 'Issue Detection',
    description: 'Automatically identify problems and optimization opportunities',
    icon: AlertTriangle,
    features: [
      'Duplicate workflow detection',
      'Performance bottleneck identification',
      'Security vulnerability scanning',
      'Compliance monitoring',
    ],
    highlight: 'Prevent issues before they impact your business',
  },
  {
    title: 'Smart Search',
    description: 'Find any workflow, data, or insight instantly',
    icon: Search,
    features: [
      'AI-powered search across all platforms',
      'Natural language queries',
      'Historical data exploration',
      'Advanced filtering and sorting',
    ],
    highlight: 'Discover insights you never knew existed',
  },
  {
    title: 'Automation Hub',
    description: 'Centralize control of all your automation tools',
    icon: Zap,
    features: [
      'Unified platform management',
      'Cross-platform automation triggers',
      'Workflow templates and best practices',
      'Team collaboration and sharing',
    ],
    highlight: 'Become an automation power user',
  },
];

export function FeatureTour({ onComplete }: FeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const currentStepData = tourSteps[currentStep];
  const StepIcon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <Dialog open onOpenChange={onComplete}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <StepIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle>{currentStepData.title}</DialogTitle>
                <DialogDescription>{currentStepData.description}</DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onComplete}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary'
                    : index < currentStep
                    ? 'bg-primary/60'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Highlight */}
          <div className="text-center">
            <Badge variant="secondary" className="px-4 py-2">
              {currentStepData.highlight}
            </Badge>
          </div>

          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentStepData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Mock Visualization */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
            <div className="text-center space-y-2">
              <StepIcon className="h-12 w-12 text-primary mx-auto" />
              <div className="text-sm text-muted-foreground">
                This feature will be available once you connect your platforms
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {tourSteps.length}
            </span>

            <Button onClick={handleNext}>
              {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}