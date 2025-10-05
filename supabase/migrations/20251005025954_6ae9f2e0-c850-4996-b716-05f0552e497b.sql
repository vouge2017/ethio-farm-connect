-- Fix animal type inconsistency by adding specific cattle types
-- This maintains backward compatibility while adding granularity

-- First, add new animal types to the enum
ALTER TYPE animal_type ADD VALUE IF NOT EXISTS 'ox';
ALTER TYPE animal_type ADD VALUE IF NOT EXISTS 'cow';
ALTER TYPE animal_type ADD VALUE IF NOT EXISTS 'calf';

-- Update the generate_animal_id function to handle new cattle types
CREATE OR REPLACE FUNCTION public.generate_animal_id(owner_name text, animal_type_param animal_type)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  -- Get type code with support for new cattle subtypes
  type_code := CASE animal_type_param
    WHEN 'cattle' THEN 'CAT'
    WHEN 'ox' THEN 'OXX'
    WHEN 'cow' THEN 'COW'
    WHEN 'calf' THEN 'CLF'
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
  
  -- Format: AB-OXX-001-2017
  result := UPPER(initials) || '-' || type_code || '-' || 
            LPAD(sequence_num::TEXT, 3, '0') || '-' || ethiopian_year::TEXT;
  
  RETURN result;
END;
$function$;