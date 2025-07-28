-- Fix infinite recursion in profiles RLS policies

-- First, drop the existing problematic policy
DROP POLICY IF EXISTS "Profiles are viewable by organization members" ON public.profiles;

-- Create a security definer function to get current user's organization
CREATE OR REPLACE FUNCTION public.get_current_user_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a new policy that uses the security definer function
CREATE POLICY "Profiles are viewable by organization members" 
ON public.profiles 
FOR SELECT 
USING (
  organization_id = public.get_current_user_organization_id() 
  OR user_id = auth.uid()
);

-- Also update the user trigger to ensure organization is created properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create organization first if organization_name is provided
  IF NEW.raw_user_meta_data ->> 'organization_name' IS NOT NULL THEN
    INSERT INTO public.organizations (name)
    VALUES (NEW.raw_user_meta_data ->> 'organization_name')
    RETURNING id INTO new_org_id;
  END IF;

  -- Insert profile with organization_id
  INSERT INTO public.profiles (
    user_id, 
    email, 
    first_name, 
    last_name,
    organization_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    new_org_id
  );
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();