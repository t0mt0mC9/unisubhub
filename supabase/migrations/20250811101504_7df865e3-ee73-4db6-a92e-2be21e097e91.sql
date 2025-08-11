-- Fix security issue: Restrict subscriber updates to record owners only
-- Replace the overly permissive update policy with a secure one

DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

CREATE POLICY "users_can_update_own_subscription" 
ON public.subscribers 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);