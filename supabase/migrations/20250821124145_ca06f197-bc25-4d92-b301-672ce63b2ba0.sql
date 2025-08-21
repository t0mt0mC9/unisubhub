-- Fix security vulnerability in subscribers table
-- Remove the email-based access which could allow unauthorized access

-- Drop the existing vulnerable policy
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;

-- Create a secure policy that only allows access by user_id
CREATE POLICY "Users can only view their own subscription data"
ON public.subscribers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Ensure the policy for insert is also secure
DROP POLICY IF EXISTS "authenticated_users_can_insert_own_subscription" ON public.subscribers;

CREATE POLICY "Users can only insert their own subscription"
ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure the policy for update is also secure
DROP POLICY IF EXISTS "users_can_update_own_subscription" ON public.subscribers;

CREATE POLICY "Users can only update their own subscription"
ON public.subscribers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);