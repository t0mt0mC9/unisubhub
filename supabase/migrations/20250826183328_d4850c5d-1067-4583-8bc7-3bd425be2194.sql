-- Créer la table pour les notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('renewal_reminder', 'dealabs_offer', 'budget_alert', 'monthly_summary')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Créer la table pour les paramètres de notification
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  email_notifications BOOLEAN NOT NULL DEFAULT false,
  budget_alerts BOOLEAN NOT NULL DEFAULT true,
  renewal_alerts BOOLEAN NOT NULL DEFAULT true,
  offer_notifications BOOLEAN NOT NULL DEFAULT true,
  monthly_summary BOOLEAN NOT NULL DEFAULT false,
  budget_limit DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les paramètres de notification
CREATE POLICY "Users can view their own notification settings" 
ON public.notification_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings" 
ON public.notification_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" 
ON public.notification_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Index pour les notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Index pour les paramètres
CREATE INDEX idx_notification_settings_user_id ON public.notification_settings(user_id);

-- Trigger pour updated_at sur notifications
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour updated_at sur notification_settings
CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();