import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Onboarding() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if user is not authenticated
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user has already completed onboarding
    const checkOnboardingStatus = async () => {
      if (profile?.first_name && profile?.last_name) {
        // User has completed basic profile setup, redirect to dashboard
        navigate('/dashboard');
      }
    };

    checkOnboardingStatus();
  }, [user, profile, navigate]);

  const handleOnboardingComplete = async () => {
    try {
      // Mark onboarding as complete
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('user_id', user.id);

        if (error) throw error;
      }

      toast({
        title: "Welcome to Automation Atlas!",
        description: "Your onboarding is complete. Let's explore your dashboard.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error completing onboarding",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return <OnboardingWizard onComplete={handleOnboardingComplete} />;
}