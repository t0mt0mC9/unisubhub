-- Fix RLS security issues on subscribers table

-- First, ensure user_id is NOT NULL (it should always be set for security)
ALTER TABLE public.subscribers 
ALTER COLUMN user_id SET NOT NULL;

-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "authenticated_users_select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "authenticated_users_insert_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "authenticated_users_update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "authenticated_users_delete_own_subscription" ON public.subscribers;

-- Create comprehensive RLS policies that cover both user_id and email access patterns
-- Users can view their own subscription data (by user_id or email)
CREATE POLICY "users_can_view_own_subscription" ON public.subscribers
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  auth.email() = email
);

-- Users can insert their own subscription data
CREATE POLICY "users_can_insert_own_subscription" ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND 
  auth.email() = email
);

-- Users can update their own subscription data
CREATE POLICY "users_can_update_own_subscription" ON public.subscribers
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR 
  auth.email() = email
)
WITH CHECK (
  auth.uid() = user_id AND 
  auth.email() = email
);

-- Users can delete their own subscription data
CREATE POLICY "users_can_delete_own_subscription" ON public.subscribers
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id OR 
  auth.email() = email
);

-- Add policy for service role (edge functions) to manage all subscription data
-- This is needed for the check-subscription edge function
CREATE POLICY "service_role_can_manage_subscriptions" ON public.subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);