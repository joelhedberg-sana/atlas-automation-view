import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, Lightbulb, Target, TrendingUp, Users } from 'lucide-react';
import { FeatureTour } from './FeatureTour';

interface DemoDataStepProps {
  onComplete: () => void;
}

const demoMetrics = [
  { label: 'Connected Platforms', value: 3, change: '+1', changeType: 'positive' },
  { label: 'Active Workflows', value: 12, change: '+4', changeType: 'positive' },
  { label: 'Monthly Executions', value: '2.4k', change: '+15%', changeType: 'positive' },
  { label: 'Issues Detected', value: 2, change: '-3', changeType: 'positive' },
];

const demoWorkflows = [
  {
    name: 'Lead Qualification Pipeline',
    platform: 'HubSpot + Zapier',
    status: 'Active',
    executions: 247,
    lastRun: '2 hours ago',
  },
  {
    name: 'Email Campaign Sync',
    platform: 'Lemlist + HubSpot',
    status: 'Active',
    executions: 156,
    lastRun: '30 minutes ago',
  },
  {
    name: 'Customer Onboarding Flow',
    platform: 'Zapier',
    status: 'Warning',
    executions: 89,
    lastRun: '1 day ago',
  },
];

export function DemoDataStep({ onComplete }: DemoDataStepProps) {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [progress, setProgress] = useState(0);

  const demos = [
    {
      title: 'Dashboard Overview',
      description: 'See all your automation metrics at a glance',
      icon: TrendingUp,
      component: (
        <div className="grid grid-cols-2 gap-4">
          {demoMetrics.map((metric) => (
            <div key={metric.label} className="bg-white rounded-lg p-4 border">
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-sm text-muted-foreground">{metric.label}</div>
              <div className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {metric.change}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Workflow Management',
      description: 'Track and manage all your automation workflows',
      icon: Target,
      component: (
        <div className="space-y-3">
          {demoWorkflows.map((workflow) => (
            <div key={workflow.name} className="bg-white rounded-lg p-4 border flex items-center justify-between">
              <div>
                <div className="font-medium">{workflow.name}</div>
                <div className="text-sm text-muted-foreground">{workflow.platform}</div>
              </div>
              <div className="text-right">
                <Badge variant={workflow.status === 'Active' ? 'default' : 'secondary'}>
                  {workflow.status}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  {workflow.executions} runs
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Smart Insights',
      description: 'Get AI-powered recommendations for optimization',
      icon: Lightbulb,
      component: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900">Optimization Opportunity</div>
                <div className="text-sm text-blue-700">
                  Your "Lead Qualification Pipeline" could be 23% more efficient by removing redundant steps.
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-900">Great Performance</div>
                <div className="text-sm text-green-700">
                  Your email campaigns are performing 31% above industry average.
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [currentDemo]);

  const currentDemoData = demos[currentDemo];
  const DemoIcon = currentDemoData.icon;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Experience Your Future Dashboard</h3>
        <p className="text-muted-foreground">
          Here's what your automation insights will look like once you connect your platforms
        </p>
      </div>

      {/* Demo Progress */}
      <div className="flex items-center justify-between text-sm">
        <span>Demo Progress</span>
        <span>{currentDemo + 1} of {demos.length}</span>
      </div>
      <Progress value={((currentDemo + 1) / demos.length) * 100} className="h-2" />

      {/* Current Demo */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DemoIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{currentDemoData.title}</CardTitle>
              <CardDescription>{currentDemoData.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentDemoData.component}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => setCurrentDemo(prev => Math.max(0, prev - 1))}
          disabled={currentDemo === 0}
        >
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          {demos.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index <= currentDemo ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {currentDemo < demos.length - 1 ? (
          <Button onClick={() => setCurrentDemo(prev => prev + 1)}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setShowTour(true)}>
              Take Tour
            </Button>
            <Button onClick={onComplete}>
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      {/* Feature Tour Modal */}
      {showTour && (
        <FeatureTour onComplete={() => setShowTour(false)} />
      )}
    </div>
  );
}