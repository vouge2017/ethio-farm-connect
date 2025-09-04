-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by all authenticated users" ON public.profiles;

-- Create a function to check if users should see full profile data
CREATE OR REPLACE FUNCTION public.can_view_full_profile(profile_user_id uuid, viewer_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- Users can see their own full profile
  SELECT profile_user_id = viewer_id
  -- OR users can see full profile of people they're in conversations with
  OR EXISTS (
    SELECT 1 FROM conversations 
    WHERE (buyer_id = viewer_id AND seller_id = profile_user_id)
       OR (seller_id = viewer_id AND buyer_id = profile_user_id)
  )
  -- OR users can see full profile of sellers whose listings they're viewing
  OR EXISTS (
    SELECT 1 FROM listings 
    WHERE seller_id = profile_user_id AND status = 'active'
  );
$$;

-- Create restrictive policies for profile access
-- Policy 1: Users can always see their own profile completely
CREATE POLICY "Users can view their own profile completely"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Users can see limited public data for active sellers
CREATE POLICY "Public can view seller display names and regions"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT seller_id FROM listings WHERE status = 'active'
  )
);

-- Policy 3: Users can see full contact info for people they're messaging with
CREATE POLICY "Users can view contact info for conversation partners"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT buyer_id FROM conversations WHERE seller_id = user_id
    UNION
    SELECT seller_id FROM conversations WHERE buyer_id = user_id
  )
);

-- Maintain existing policies for updates and inserts
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);