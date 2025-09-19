-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create review_links table to store generated links
CREATE TABLE public.review_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  link_id TEXT NOT NULL UNIQUE,
  name TEXT,
  google_review_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create ratings table to store customer ratings
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_link_id UUID NOT NULL REFERENCES public.review_links(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  redirected_to_google BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create feedback table for detailed feedback from low ratings
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID NOT NULL REFERENCES public.ratings(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  improvement_suggestions TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for review_links
CREATE POLICY "Users can view their own review links" 
ON public.review_links FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own review links" 
ON public.review_links FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own review links" 
ON public.review_links FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review links" 
ON public.review_links FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all review links" 
ON public.review_links FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for ratings
CREATE POLICY "Users can view ratings for their review links" 
ON public.ratings FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.review_links 
    WHERE id = review_link_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Public can insert ratings" 
ON public.ratings FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all ratings" 
ON public.ratings FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for feedback
CREATE POLICY "Users can view feedback for their review links" 
ON public.feedback FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.ratings r
    JOIN public.review_links rl ON r.review_link_id = rl.id
    WHERE r.id = rating_id AND rl.user_id = auth.uid()
  )
);

CREATE POLICY "Public can insert feedback" 
ON public.feedback FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all feedback" 
ON public.feedback FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_review_links_updated_at
  BEFORE UPDATE ON public.review_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Indexes for better performance
CREATE INDEX idx_review_links_user_id ON public.review_links(user_id);
CREATE INDEX idx_review_links_link_id ON public.review_links(link_id);
CREATE INDEX idx_ratings_review_link_id ON public.ratings(review_link_id);
CREATE INDEX idx_ratings_created_at ON public.ratings(created_at);
CREATE INDEX idx_feedback_rating_id ON public.feedback(rating_id);