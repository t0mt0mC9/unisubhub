-- Check if there's a unique constraint on (referrer_user_id, referred_email)
-- and add it if missing to prevent duplicate emails per user

-- First, let's clean up any existing duplicates
-- Keep only the most recent entry for each (referrer_user_id, referred_email) combination
DELETE FROM public.referrals r1
WHERE EXISTS (
  SELECT 1 FROM public.referrals r2 
  WHERE r2.referrer_user_id = r1.referrer_user_id 
    AND r2.referred_email = r1.referred_email 
    AND r2.created_at > r1.created_at
);

-- Add unique constraint to prevent future duplicates
-- This will ensure each referrer can only invite each email once
ALTER TABLE public.referrals 
ADD CONSTRAINT referrals_referrer_email_unique 
UNIQUE (referrer_user_id, referred_email);