-- Fix OTP verification table RLS policies to be more restrictive
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can view own OTP" ON public.otp_verifications;
DROP POLICY IF EXISTS "Anyone can create OTP" ON public.otp_verifications;
DROP POLICY IF EXISTS "Anyone can update OTP" ON public.otp_verifications;

-- OTP table should only be accessed by edge functions using service role
-- No direct RLS access for regular users - they go through edge functions
-- We'll create restrictive policies that effectively deny all direct access
CREATE POLICY "No direct access to OTP table"
  ON public.otp_verifications FOR SELECT
  USING (false);

CREATE POLICY "No direct insert to OTP table"
  ON public.otp_verifications FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update to OTP table"
  ON public.otp_verifications FOR UPDATE
  USING (false);