-- Fix security warnings by updating function search paths

-- Update the update_updated_at_column function with proper search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update the generate_animal_id function with proper search path
CREATE OR REPLACE FUNCTION public.generate_animal_id(
  owner_name TEXT,
  animal_type_param animal_type
) RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  initials TEXT;
  type_code TEXT;
  sequence_num INTEGER;
  ethiopian_year INTEGER;
  result TEXT;
BEGIN
  -- Get initials from owner name (first letter of each word)
  SELECT string_agg(left(word, 1), '') INTO initials
  FROM unnest(string_to_array(owner_name, ' ')) AS word;
  
  -- Get type code
  type_code := CASE animal_type_param
    WHEN 'cattle' THEN 'CAT'
    WHEN 'goat' THEN 'GOT'
    WHEN 'sheep' THEN 'SHP'
    WHEN 'chicken' THEN 'CHK'
    WHEN 'camel' THEN 'CAM'
    WHEN 'donkey' THEN 'DON'
    WHEN 'horse' THEN 'HOR'
    ELSE 'OTH'
  END;
  
  -- Get current Ethiopian year (approximately Gregorian year - 7/8)
  ethiopian_year := EXTRACT(year FROM CURRENT_DATE) - 7;
  
  -- Get next sequence number for this owner and type
  SELECT COALESCE(MAX(
    CAST(split_part(animal_id, '-', 3) AS INTEGER)
  ), 0) + 1 INTO sequence_num
  FROM public.animals 
  WHERE owner_id = auth.uid() 
  AND type = animal_type_param;
  
  -- Format: AB-CAT-001-2017
  result := UPPER(initials) || '-' || type_code || '-' || 
            LPAD(sequence_num::TEXT, 3, '0') || '-' || ethiopian_year::TEXT;
  
  RETURN result;
END;
$$;

-- Update the generate_listing_id function with proper search path
CREATE OR REPLACE FUNCTION public.generate_listing_id() 
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  sequence_num INTEGER;
  ethiopian_year INTEGER;
  result TEXT;
BEGIN
  -- Get current Ethiopian year
  ethiopian_year := EXTRACT(year FROM CURRENT_DATE) - 7;
  
  -- Get next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(split_part(listing_id, '-', 3) AS INTEGER)
  ), 0) + 1 INTO sequence_num
  FROM public.listings 
  WHERE listing_id LIKE 'YG-' || ethiopian_year::TEXT || '-%';
  
  -- Format: YG-2017-001234
  result := 'YG-' || ethiopian_year::TEXT || '-' || 
            LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN result;
END;
$$;

-- Add missing RLS policy for otp_logs (was flagged as having RLS enabled but no policies)
CREATE POLICY "Users can manage their own OTP logs" ON public.otp_logs
  FOR ALL USING (phone_number IN (
    SELECT phone_number FROM public.profiles WHERE user_id = auth.uid()
  ));