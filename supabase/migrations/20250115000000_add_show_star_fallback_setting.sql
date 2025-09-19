-- Add show_star_fallback setting to profiles table
ALTER TABLE public.profiles 
ADD COLUMN show_star_fallback BOOLEAN DEFAULT TRUE;
