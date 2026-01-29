-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create complaint status enum
CREATE TYPE public.complaint_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create complaint category enum
CREATE TYPE public.complaint_category AS ENUM ('garbage', 'street_light', 'road_maintenance', 'water_supply', 'drainage', 'public_safety');

-- Create urgency level enum
CREATE TYPE public.urgency_level AS ENUM ('high', 'medium', 'low');

-- Create user roles table (separate from profiles as per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  reward_points INTEGER NOT NULL DEFAULT 0,
  otp_verified BOOLEAN NOT NULL DEFAULT false,
  location_permission_granted BOOLEAN NOT NULL DEFAULT false,
  camera_permission_granted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category complaint_category NOT NULL,
  description TEXT,
  photo_url TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location_address TEXT,
  status complaint_status NOT NULL DEFAULT 'pending',
  urgency urgency_level,
  admin_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reward points ledger
CREATE TABLE public.reward_points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE SET NULL,
  points_earned INTEGER NOT NULL DEFAULT 10,
  redeem_code TEXT UNIQUE,
  redeemed BOOLEAN NOT NULL DEFAULT false,
  reason TEXT NOT NULL DEFAULT 'Complaint Resolved',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create OTP verification table
CREATE TABLE public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin());

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles (limited)"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- RLS Policies for complaints
CREATE POLICY "Users can view own complaints"
  ON public.complaints FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending complaints"
  ON public.complaints FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can delete own pending complaints"
  ON public.complaints FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all complaints"
  ON public.complaints FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all complaints"
  ON public.complaints FOR UPDATE
  USING (public.is_admin());

-- RLS Policies for reward_points_ledger
CREATE POLICY "Users can view own rewards"
  ON public.reward_points_ledger FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all rewards"
  ON public.reward_points_ledger FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can create rewards"
  ON public.reward_points_ledger FOR INSERT
  WITH CHECK (public.is_admin());

-- RLS Policies for otp_verifications (service role only effectively)
CREATE POLICY "Users can view own OTP"
  ON public.otp_verifications FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create OTP"
  ON public.otp_verifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update OTP"
  ON public.otp_verifications FOR UPDATE
  USING (true);

-- Create storage bucket for complaint photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'complaint-photos',
  'complaint-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Storage policies for complaint photos
CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'complaint-photos');

CREATE POLICY "Anyone can view complaint photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'complaint-photos');

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'complaint-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes for performance
CREATE INDEX idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_category ON public.complaints(category);
CREATE INDEX idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX idx_reward_points_user_id ON public.reward_points_ledger(user_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);