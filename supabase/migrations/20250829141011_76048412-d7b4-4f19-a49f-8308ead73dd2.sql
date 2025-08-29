-- Create enum for listing categories
CREATE TYPE listing_category AS ENUM ('livestock', 'machinery', 'equipment', 'feed', 'medicine');

-- Add category and attributes columns to listings table
ALTER TABLE public.listings 
ADD COLUMN category listing_category NOT NULL DEFAULT 'livestock',
ADD COLUMN attributes JSONB DEFAULT '{}';

-- Create index for better performance on category and attributes queries
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_attributes ON public.listings USING GIN(attributes);

-- Update existing listings to have livestock category (since they're all animals currently)
UPDATE public.listings SET category = 'livestock';