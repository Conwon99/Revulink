-- Add onboarding fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN google_review_link TEXT,
ADD COLUMN logo_url TEXT,
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;