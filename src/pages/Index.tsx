import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Network, AlertTriangle, ArrowRight, Zap } from "lucide-react";

const Index = () => {
  const features = [
    {
      title: "Dashboard Overview",
      description: "Monitor all your automation tools and flows in one centralized view",
      icon: BarChart3,
      path: "/dashboard",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Interactive Canvas",
      description: "Visualize automation relationships with an interactive flow diagram",
      icon: Network,
      path: "/canvas", 
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: "Issue Detection",
      description: "Identify and resolve duplicate flows and orphaned automations",
      icon: AlertTriangle,
      path: "/issues",
      color: "bg-amber-500/10 text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to <span className="text-primary">Automation Atlas</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your visual automation explorer. Discover, manage, and optimize all your company automations 
            from Zapier, Make, HubSpot and more in one powerful dashboard.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button asChild size="lg">
              <Link to="/dashboard" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/canvas">View Canvas</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.path} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                <Link to={feature.path}>
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                      Explore
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>

        {/* Status Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-primary">3</div>
            <div className="text-sm text-muted-foreground">Connected Tools</div>
          </div>
          <div className="bg-card border rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-600">3</div>
            <div className="text-sm text-muted-foreground">Active Flows</div>
          </div>
          <div className="bg-card border rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-amber-600">2</div>
            <div className="text-sm text-muted-foreground">Issues Found</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
