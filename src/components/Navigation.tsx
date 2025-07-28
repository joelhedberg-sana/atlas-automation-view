import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Network, AlertTriangle, Home, LogOut, User, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/canvas", label: "Canvas", icon: Network },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/security", label: "Security", icon: Shield },
  ];

  return (
    <nav className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AA</span>
              </div>
              <span className="font-semibold text-lg">Automation Atlas</span>
            </Link>
            
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    asChild
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    className="h-9"
                  >
                    <Link to={item.path} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">{user.email}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
            <Badge variant="outline" className="hidden sm:flex">
              v1.0.0
            </Badge>
          </div>
        </div>
      </div>
    </nav>
  );
}