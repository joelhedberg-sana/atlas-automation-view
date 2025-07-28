-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.get_current_user_organization_id()
RETURNS UUID
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$;