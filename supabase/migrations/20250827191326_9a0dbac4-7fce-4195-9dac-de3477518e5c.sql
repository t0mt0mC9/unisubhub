-- Create secure bank connections table for encrypted token storage
CREATE TABLE public.bank_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'powens', 'budget_insight', etc.
  encrypted_user_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_provider UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for bank_connections
CREATE POLICY "Users can view their own bank connections" 
ON public.bank_connections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bank connections" 
ON public.bank_connections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank connections" 
ON public.bank_connections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank connections" 
ON public.bank_connections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_bank_connections_updated_at
BEFORE UPDATE ON public.bank_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update notification policies to be more secure
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Service role can insert notifications" 
ON public.notifications 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Add privacy settings to profiles for external AI consent
ALTER TABLE public.profiles 
ADD COLUMN ai_insights_consent BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN privacy_settings JSONB DEFAULT '{}'::jsonb;

-- Add DELETE policy to notification_settings for users
CREATE POLICY "Users can delete their own notification settings" 
ON public.notification_settings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix subscribers table to remove email-based access (keep only uid-based)
DROP POLICY IF EXISTS "users_can_view_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "users_can_insert_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "users_can_update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "users_can_delete_own_subscription" ON public.subscribers;

CREATE POLICY "users_can_view_own_subscription" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_subscription" 
ON public.subscribers 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_subscription" 
ON public.subscribers 
FOR DELETE 
USING (auth.uid() = user_id);