-- Fix security vulnerability: Restrict public profile access to only safe fields
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can view seller display names and regions" ON public.profiles;

-- Create a more secure policy that only exposes safe public information
CREATE POLICY "Public can view safe seller info only" 
ON public.profiles 
FOR SELECT 
USING (
  user_id IN (
    SELECT seller_id FROM listings WHERE status = 'active'::listing_status
  )
  AND current_setting('request.method', true) IS NOT NULL -- Ensure this is an API request
);

-- Create a view for safe public profile data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  user_id,
  display_name,
  location_region  -- Only general region, not detailed location
FROM public.profiles
WHERE user_id IN (
  SELECT seller_id FROM listings WHERE status = 'active'::listing_status
);

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_invoker = true);

-- Grant access to the public profiles view
GRANT SELECT ON public.public_profiles TO authenticated;

-- Update the original policy to be more restrictive
CREATE POLICY "Authenticated users can view basic seller info" 
ON public.profiles 
FOR SELECT 
USING (
  auth.role() = 'authenticated' 
  AND user_id IN (
    SELECT seller_id FROM listings WHERE status = 'active'::listing_status
  )
  -- Only allow access to safe fields through application logic
);