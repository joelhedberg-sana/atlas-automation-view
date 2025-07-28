import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  firstName: string;
  lastName: string;
  organizationName: string;
  department: string;
}

interface ProfileSetupStepProps {
  data: ProfileData;
  onComplete: (data: { profile: ProfileData }) => void;
}

export function ProfileSetupStep({ data, onComplete }: ProfileSetupStepProps) {
  const [formData, setFormData] = useState<ProfileData>(data);
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update user profile in Supabase
      if (user && profile) {
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            department: formData.department as any,
          })
          .eq('user_id', user.id);

        if (error) throw error;

        // Create or update organization
        const { error: orgError } = await supabase
          .from('organizations')
          .upsert({
            id: profile.organization_id,
            name: formData.organizationName,
          });

        if (orgError) throw orgError;
      }

      onComplete({ profile: formData });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = formData.firstName && formData.lastName && 
                 formData.organizationName && formData.department;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="John"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Doe"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name</Label>
          <Input
            id="organizationName"
            value={formData.organizationName}
            onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
            placeholder="Your Company Name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="customer_success">Customer Success</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="hr">Human Resources</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!isValid || isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}