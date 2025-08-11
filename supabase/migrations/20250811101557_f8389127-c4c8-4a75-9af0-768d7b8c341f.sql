-- Fix security issue: Restrict subscriber inserts to authenticated users only
-- Replace the overly permissive insert policy with a secure one

DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

CREATE POLICY "authenticated_users_can_insert_own_subscription" 
ON public.subscribers 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);