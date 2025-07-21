import { Navigation } from "@/components/Navigation";
import AdvancedAnalyticsDashboard from "@/components/AdvancedAnalyticsDashboard";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Advanced Analytics</h1>
            <p className="text-muted-foreground">
              AI-powered insights into your automation performance, ROI, and optimization opportunities
            </p>
          </div>
          
          <AdvancedAnalyticsDashboard />
        </div>
      </div>
    </div>
  );
};

export default Analytics;