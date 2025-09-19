-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all review links" ON public.review_links;
DROP POLICY IF EXISTS "Admins can view all ratings" ON public.ratings;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Recreate admin policies using the security definer function
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all review links" ON public.review_links
FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all ratings" ON public.ratings
FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all feedback" ON public.feedback
FOR SELECT USING (public.get_current_user_role() = 'admin');