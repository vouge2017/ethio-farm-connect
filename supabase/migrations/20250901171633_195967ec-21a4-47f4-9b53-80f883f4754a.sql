-- Create storage buckets for media management
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES 
('listing-photos', 'listing-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
('listing-videos', 'listing-videos', true, 52428800, ARRAY['video/mp4', 'video/webm']),
('animal-photos', 'animal-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Create storage policies for listing photos
CREATE POLICY "Authenticated users can upload listing photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'listing-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view listing photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'listing-photos');

CREATE POLICY "Users can update their own listing photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own listing photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for listing videos
CREATE POLICY "Authenticated users can upload listing videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'listing-videos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view listing videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'listing-videos');

CREATE POLICY "Users can update their own listing videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'listing-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own listing videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'listing-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for animal photos
CREATE POLICY "Authenticated users can upload animal photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'animal-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view animal photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'animal-photos');

CREATE POLICY "Users can update their own animal photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'animal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own animal photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'animal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add admin role to user_role enum (if not already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('farmer', 'buyer', 'admin', 'vet');
  ELSE
    -- Check if admin role exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM unnest(enum_range(NULL::user_role)) AS t(v) WHERE v = 'admin') THEN
      ALTER TYPE user_role ADD VALUE 'admin';
    END IF;
  END IF;
END $$;