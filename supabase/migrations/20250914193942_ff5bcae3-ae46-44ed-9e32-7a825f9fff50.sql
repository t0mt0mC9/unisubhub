-- Fix the INSERT policy for subscriptions table
-- The current policy has no qualifier, which might be blocking insertions

DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can create their own subscriptions" 
ON public.subscriptions 
FOR INSERT 
TO public 
WITH CHECK (auth.uid() = user_id);