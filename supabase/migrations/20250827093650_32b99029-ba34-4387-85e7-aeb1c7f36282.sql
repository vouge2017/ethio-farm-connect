-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE animal_type AS ENUM ('cattle', 'goat', 'sheep', 'chicken', 'camel', 'donkey', 'horse', 'other');
CREATE TYPE animal_gender AS ENUM ('male', 'female', 'unknown');
CREATE TYPE verification_tier AS ENUM ('free', 'video_verified', 'vet_inspected');
CREATE TYPE listing_status AS ENUM ('active', 'pending_sale', 'sold', 'unavailable', 'expired');
CREATE TYPE question_status AS ENUM ('open', 'answered', 'closed');
CREATE TYPE user_role AS ENUM ('farmer', 'vet', 'admin');
CREATE TYPE message_type AS ENUM ('text', 'image', 'quick_reply');
CREATE TYPE otp_channel AS ENUM ('sms', 'telegram');

-- User profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  phone_number TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'farmer',
  location_region TEXT,
  location_zone TEXT,
  location_woreda TEXT,
  telegram_username TEXT,
  preferred_otp_channel otp_channel DEFAULT 'sms',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Animals table
CREATE TABLE public.animals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  animal_id TEXT NOT NULL UNIQUE, -- Generated unique ID like "AB-CAT-001-2017"
  name TEXT,
  type animal_type NOT NULL,
  breed TEXT,
  gender animal_gender DEFAULT 'unknown',
  birth_date DATE,
  acquisition_date DATE DEFAULT CURRENT_DATE,
  mother_id UUID REFERENCES public.animals(id),
  father_id UUID REFERENCES public.animals(id),
  photos TEXT[], -- Array of image URLs
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Health records table
CREATE TABLE public.health_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  record_type TEXT NOT NULL, -- 'vaccination', 'illness', 'treatment', 'checkup'
  description TEXT NOT NULL,
  vet_name TEXT,
  medications TEXT,
  next_checkup_date DATE,
  photos TEXT[],
  created_by UUID NOT NULL REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Milk production records
CREATE TABLE public.milk_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  production_date DATE NOT NULL DEFAULT CURRENT_DATE,
  morning_amount DECIMAL(5,2) DEFAULT 0,
  evening_amount DECIMAL(5,2) DEFAULT 0,
  total_amount DECIMAL(5,2) GENERATED ALWAYS AS (morning_amount + evening_amount) STORED,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(animal_id, production_date)
);

-- Marketplace listings
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id TEXT NOT NULL UNIQUE, -- Human-readable ID like "YG-2017-001234"
  seller_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  animal_id UUID REFERENCES public.animals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  verification_tier verification_tier DEFAULT 'free',
  status listing_status DEFAULT 'active',
  photos TEXT[] NOT NULL, -- At least one photo required
  videos TEXT[], -- Optional videos
  location_region TEXT NOT NULL,
  location_zone TEXT,
  location_woreda TEXT,
  contact_phone TEXT,
  contact_telegram TEXT,
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  verification_notes TEXT,
  verified_by UUID REFERENCES public.profiles(user_id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Conversations between users
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(listing_id, buyer_id, seller_id)
);

-- Messages within conversations
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type message_type DEFAULT 'text',
  image_url TEXT,
  is_quick_reply BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Veterinarian profiles
CREATE TABLE public.vet_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  license_number TEXT NOT NULL UNIQUE,
  specializations TEXT[],
  years_experience INTEGER,
  education TEXT,
  consultation_fee DECIMAL(8,2),
  available_hours TEXT,
  service_areas TEXT[], -- Regions/zones they serve
  is_verified BOOLEAN DEFAULT false,
  license_document_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Q&A questions
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  animal_type animal_type,
  status question_status DEFAULT 'open',
  photos TEXT[],
  audio_url TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Q&A answers
CREATE TABLE public.answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_vet_answer BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Daily tips content
CREATE TABLE public.daily_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_am TEXT NOT NULL, -- Amharic title
  title_om TEXT, -- Afaan Oromo title
  title_en TEXT, -- English title
  content_am TEXT NOT NULL, -- Amharic content
  content_om TEXT, -- Afaan Oromo content
  content_en TEXT, -- English content
  category TEXT NOT NULL,
  animal_types animal_type[],
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  publish_date DATE,
  created_by UUID NOT NULL REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- OTP tracking table
CREATE TABLE public.otp_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  channel otp_channel NOT NULL,
  attempts INTEGER DEFAULT 0,
  is_used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milk_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vet_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Profiles are viewable by all authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for animals
CREATE POLICY "Users can manage their own animals" ON public.animals
  FOR ALL USING (auth.uid() = owner_id);

-- Create RLS policies for health records
CREATE POLICY "Users can manage health records for their animals" ON public.health_records
  FOR ALL USING (
    auth.uid() IN (
      SELECT owner_id FROM public.animals WHERE id = health_records.animal_id
    )
  );

-- Create RLS policies for milk records
CREATE POLICY "Users can manage milk records for their animals" ON public.milk_records
  FOR ALL USING (
    auth.uid() IN (
      SELECT owner_id FROM public.animals WHERE id = milk_records.animal_id
    )
  );

-- Create RLS policies for listings
CREATE POLICY "Users can manage their own listings" ON public.listings
  FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "All authenticated users can view active listings" ON public.listings
  FOR SELECT USING (auth.role() = 'authenticated' AND status = 'active');

-- Create RLS policies for conversations
CREATE POLICY "Users can access their conversations" ON public.conversations
  FOR ALL USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Create RLS policies for messages
CREATE POLICY "Users can access messages in their conversations" ON public.messages
  FOR ALL USING (
    auth.uid() IN (
      SELECT buyer_id FROM public.conversations WHERE id = messages.conversation_id
      UNION
      SELECT seller_id FROM public.conversations WHERE id = messages.conversation_id
    )
  );

-- Create RLS policies for questions and answers
CREATE POLICY "All authenticated users can view questions" ON public.questions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own questions" ON public.questions
  FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "All authenticated users can view answers" ON public.answers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own answers" ON public.answers
  FOR ALL USING (auth.uid() = author_id);

-- Create RLS policies for vet profiles
CREATE POLICY "All authenticated users can view verified vet profiles" ON public.vet_profiles
  FOR SELECT USING (auth.role() = 'authenticated' AND is_verified = true);

CREATE POLICY "Vets can manage their own profiles" ON public.vet_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for daily tips
CREATE POLICY "All users can view published tips" ON public.daily_tips
  FOR SELECT USING (is_published = true);

-- Create function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_animals_updated_at
  BEFORE UPDATE ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vet_profiles_updated_at
  BEFORE UPDATE ON public.vet_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_answers_updated_at
  BEFORE UPDATE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate unique animal IDs
CREATE OR REPLACE FUNCTION public.generate_animal_id(
  owner_name TEXT,
  animal_type_param animal_type
) RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate unique listing IDs
CREATE OR REPLACE FUNCTION public.generate_listing_id() RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX idx_animals_owner_id ON public.animals(owner_id);
CREATE INDEX idx_animals_type ON public.animals(type);
CREATE INDEX idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_location ON public.listings(location_region, location_zone);
CREATE INDEX idx_conversations_participants ON public.conversations(buyer_id, seller_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_questions_status ON public.questions(status);
CREATE INDEX idx_health_records_animal ON public.health_records(animal_id);
CREATE INDEX idx_milk_records_animal_date ON public.milk_records(animal_id, production_date);