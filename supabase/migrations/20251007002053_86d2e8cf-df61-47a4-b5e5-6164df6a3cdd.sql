-- Create dummy test data for user: test@example.com (5b0e6eca-d1e7-4a44-b23e-f90c50e6c785)

-- Create profile for test user
INSERT INTO profiles (user_id, phone_number, display_name, location_region, location_zone, location_woreda, telegram_username, role)
VALUES 
  ('5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', '+251911234567', 'Test Farmer', 'Oromia', 'East Shewa', 'Ada''a', '@testfarmer', 'farmer')
ON CONFLICT (user_id) DO UPDATE SET
  phone_number = EXCLUDED.phone_number,
  display_name = EXCLUDED.display_name,
  location_region = EXCLUDED.location_region;

-- Create test animals
INSERT INTO animals (id, owner_id, animal_id, name, type, breed, gender, birth_date, photos, notes)
VALUES 
  ('10000000-0000-0000-0000-000000000001', '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', 'TF-OXX-001-2017', 'Boru', 'ox', 'Boran', 'male', '2022-03-15', ARRAY['https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800'], 'Strong working ox, excellent for plowing'),
  ('10000000-0000-0000-0000-000000000002', '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', 'TF-COW-001-2017', 'Desta', 'cow', 'Holstein Friesian', 'female', '2021-06-20', ARRAY['https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800'], 'Good milk producer, 15 liters per day'),
  ('10000000-0000-0000-0000-000000000003', '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', 'TF-CLF-001-2017', 'Chaltu', 'calf', 'Holstein Friesian', 'female', '2024-01-10', ARRAY['https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800'], 'Young calf, daughter of Desta'),
  ('10000000-0000-0000-0000-000000000004', '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', 'TF-GOT-001-2017', 'Kedir', 'goat', 'Afar', 'male', '2023-08-05', ARRAY['https://images.unsplash.com/photo-1554475900-4e0c0c580f58?w=800'], 'Healthy breeding goat'),
  ('10000000-0000-0000-0000-000000000005', '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', 'TF-SHP-001-2017', 'Seble', 'sheep', 'Menz', 'female', '2023-02-14', ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], 'Good wool quality')
ON CONFLICT (id) DO NOTHING;

-- Create test health records
INSERT INTO health_records (animal_id, record_type, description, record_date, vet_name, medications, created_by)
VALUES 
  ('10000000-0000-0000-0000-000000000001', 'vaccination', 'Annual vaccination for foot and mouth disease', '2024-09-15', 'Dr. Abebe Tadesse', 'FMD Vaccine', '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785'),
  ('10000000-0000-0000-0000-000000000002', 'checkup', 'Routine pregnancy check', '2024-08-20', 'Dr. Almaz Bekele', 'None', '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785'),
  ('10000000-0000-0000-0000-000000000002', 'treatment', 'Mastitis treatment', '2024-07-10', 'Dr. Abebe Tadesse', 'Antibiotics', '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785')
ON CONFLICT DO NOTHING;

-- Create test milk records
INSERT INTO milk_records (animal_id, production_date, morning_amount, evening_amount, created_by, notes)
VALUES 
  ('10000000-0000-0000-0000-000000000002', CURRENT_DATE - 1, 7.5, 7.0, '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', 'Normal production'),
  ('10000000-0000-0000-0000-000000000002', CURRENT_DATE - 2, 8.0, 7.5, '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', 'Increased production'),
  ('10000000-0000-0000-0000-000000000002', CURRENT_DATE - 3, 7.0, 7.5, '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', 'Normal production'),
  ('10000000-0000-0000-0000-000000000002', CURRENT_DATE - 4, 7.8, 7.2, '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', 'Good production'),
  ('10000000-0000-0000-0000-000000000002', CURRENT_DATE - 5, 7.3, 7.8, '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', 'Normal production')
ON CONFLICT DO NOTHING;

-- Create test listings
INSERT INTO listings (id, listing_id, seller_id, animal_id, title, description, price, category, location_region, location_zone, location_woreda, photos, status, attributes)
VALUES 
  ('20000000-0000-0000-0000-000000000001', 'YG-2017-000001', '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', '10000000-0000-0000-0000-000000000001', 'Strong Working Ox - Boru', 'Excellent working ox, 2.5 years old, Boran breed. Very strong and well-trained for plowing. Healthy with all vaccinations up to date.', 45000, 'livestock', 'Oromia', 'East Shewa', 'Ada''a', ARRAY['https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800'], 'active', '{"breed": "Boran", "gender": "male", "type": "ox"}'::jsonb),
  ('20000000-0000-0000-0000-000000000002', 'YG-2017-000002', '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', NULL, 'Tractor - Massey Ferguson 240', 'Well-maintained tractor, 2018 model. 3000 hours of usage. Good for medium-sized farms. Includes attachments.', 850000, 'machinery', 'Oromia', 'East Shewa', 'Ada''a', ARRAY['https://images.unsplash.com/photo-1595407660626-db7fdc717daa?w=800'], 'active', '{"machineType": "tractor", "condition": "good"}'::jsonb),
  ('20000000-0000-0000-0000-000000000003', 'YG-2017-000003', '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', '10000000-0000-0000-0000-000000000004', 'Breeding Goat - Afar', 'Healthy Afar breed goat, excellent for breeding. 1.5 years old, all vaccinations complete.', 8500, 'livestock', 'Oromia', 'East Shewa', 'Ada''a', ARRAY['https://images.unsplash.com/photo-1554475900-4e0c0c580f58?w=800'], 'active', '{"breed": "Afar", "gender": "male", "type": "goat"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Create test daily tips
INSERT INTO daily_tips (title_am, title_en, content_am, content_en, category, animal_types, is_published, publish_date, created_by, image_url)
VALUES 
  ('የከብት ጤና እንክብካቤ', 'Cattle Health Care Tips', 'ከብቶችዎን ጤናማ ለማድረግ መደበኛ ክትባቶችን ያረጋግጡ እና ንፁህ ውሃ ያቅርቡ።', 'Ensure regular vaccinations for your cattle and provide clean water. Check for signs of illness daily.', 'health', ARRAY['ox','cow','calf','cattle']::animal_type[], true, CURRENT_DATE, '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800'),
  ('የፍየል እንክብካቤ መመሪያዎች', 'Goat Care Guidelines', 'ፍየሎችዎን በንፅህና ባለ ቦታ ያስቀምጡ እና የተመጣጠነ ምግብ ያቅርቡ።', 'Keep your goats in a clean, dry shelter and provide balanced nutrition including minerals.', 'nutrition', ARRAY['goat']::animal_type[], true, CURRENT_DATE - 1, '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', 'https://images.unsplash.com/photo-1554475900-4e0c0c580f58?w=800'),
  ('የወተት ምርት መጨመር', 'Increase Milk Production', 'የወተት ምርትን ለመጨመር ጥራት ያለው መኖ እና ንፁህ ውሃ ያቅርቡ።', 'To increase milk production, provide quality feed and clean water. Maintain regular milking schedules.', 'nutrition', ARRAY['cow']::animal_type[], true, CURRENT_DATE - 2, '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800')
ON CONFLICT DO NOTHING;

-- Create community questions
INSERT INTO questions (id, author_id, title, content, animal_type, status, photos)
VALUES 
  ('30000000-0000-0000-0000-000000000001', '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', 'Best feed for dairy cows?', 'What is the best feed combination to increase milk production in Holstein cows?', 'cow', 'open', ARRAY[]::text[]),
  ('30000000-0000-0000-0000-000000000002', '5b0e6eca-d1e7-4a44-b23e-f90c50e6c785', 'Goat vaccination schedule', 'What is the recommended vaccination schedule for goats in Ethiopia?', 'goat', 'open', ARRAY[]::text[])
ON CONFLICT (id) DO NOTHING;