-- Add indexes to foreign key columns and frequently queried columns
-- to improve database query performance.

-- Index for fetching answers for a specific question
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);

-- Index for fetching questions by a specific author
CREATE INDEX IF NOT EXISTS idx_questions_author_id ON public.questions(author_id);

-- Index for fetching conversations related to a specific listing
CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON public.conversations(listing_id);

-- Index for joining vet_profiles with profiles
CREATE INDEX IF NOT EXISTS idx_vet_profiles_user_id ON public.vet_profiles(user_id);

-- Index for RLS policy on vet_profiles
CREATE INDEX IF NOT EXISTS idx_vet_profiles_is_verified ON public.vet_profiles(is_verified);

-- Index for created_by foreign keys
CREATE INDEX IF NOT EXISTS idx_health_records_created_by ON public.health_records(created_by);
CREATE INDEX IF NOT EXISTS idx_milk_records_created_by ON public.milk_records(created_by);
CREATE INDEX IF NOT EXISTS idx_answers_author_id ON public.answers(author_id);

-- Index for filtering daily tips by category
CREATE INDEX IF NOT EXISTS idx_daily_tips_category ON public.daily_tips(category);