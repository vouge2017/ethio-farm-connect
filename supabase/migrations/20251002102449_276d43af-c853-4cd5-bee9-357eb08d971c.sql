-- CRITICAL SECURITY: Move roles to separate table (Fixed version)

-- Create role enum (matching existing user_role enum values)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'vet', 'farmer');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Migrate existing roles from profiles to user_roles (text cast workaround)
INSERT INTO public.user_roles (user_id, role)
SELECT 
    user_id, 
    CASE role::text
        WHEN 'admin' THEN 'admin'::app_role
        WHEN 'moderator' THEN 'moderator'::app_role
        WHEN 'vet' THEN 'vet'::app_role
        WHEN 'farmer' THEN 'farmer'::app_role
    END as role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Mark profiles.role as deprecated
COMMENT ON COLUMN public.profiles.role IS 'DEPRECATED: Use user_roles table instead. Will be removed in future migration.';

-- Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);