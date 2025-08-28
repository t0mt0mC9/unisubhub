-- Créer une table pour suivre l'exécution des tâches automatisées
CREATE TABLE public.automated_tasks_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_name TEXT NOT NULL,
  execution_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  notifications_sent INTEGER DEFAULT 0,
  users_processed INTEGER DEFAULT 0,
  error_message TEXT,
  execution_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.automated_tasks_log ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre la lecture par les utilisateurs authentifiés (pour le dashboard)
CREATE POLICY "Authenticated users can view automated tasks log"
ON public.automated_tasks_log
FOR SELECT
TO authenticated
USING (true);

-- Policy pour permettre l'insertion par les edge functions (service role)
CREATE POLICY "Service role can manage automated tasks log"
ON public.automated_tasks_log
FOR ALL
USING (true)
WITH CHECK (true);

-- Créer un trigger pour update_updated_at
CREATE TRIGGER update_automated_tasks_log_updated_at
  BEFORE UPDATE ON public.automated_tasks_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Créer un index pour améliorer les performances des requêtes par date
CREATE INDEX idx_automated_tasks_log_execution_date ON public.automated_tasks_log(execution_date DESC);
CREATE INDEX idx_automated_tasks_log_task_name ON public.automated_tasks_log(task_name);