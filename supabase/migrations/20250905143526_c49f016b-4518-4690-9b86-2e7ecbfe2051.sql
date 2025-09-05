-- Create storage bucket for animal photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('animal-photos', 'animal-photos', true);

-- Create RLS policies for animal photos
CREATE POLICY "Users can view animal photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'animal-photos');

CREATE POLICY "Users can upload photos for their animals" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'animal-photos' 
  AND auth.uid() IN (
    SELECT owner_id FROM animals 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can update photos for their animals" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'animal-photos' 
  AND auth.uid() IN (
    SELECT owner_id FROM animals 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can delete photos for their animals" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'animal-photos' 
  AND auth.uid() IN (
    SELECT owner_id FROM animals 
    WHERE id::text = (storage.foldername(name))[1]
  )
);