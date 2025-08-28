-- Activer l'extension pg_cron si elle n'est pas déjà activée
-- Cette extension permet de programmer des tâches récurrentes
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Activer l'extension pg_net si elle n'est pas déjà activée  
-- Cette extension permet de faire des requêtes HTTP depuis PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Configuration des tâches cron pour automatiser les notifications

-- 1. Programmer les alertes budget automatisées (tous les dimanches à 9h00 UTC)
-- Cela correspond à 10h00 en France en hiver et 11h00 en été
SELECT cron.schedule(
  'automated-budget-alerts-sunday',
  '0 9 * * 0',  -- Tous les dimanches à 9h00 UTC
  $$
  SELECT
    net.http_post(
      url := 'https://rhmxohcqyyyglgmtnioc.supabase.co/functions/v1/automated-budget-alerts',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJobXhvaGNxeXl5Z2xnbXRuaW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDgxODYsImV4cCI6MjA2OTQ4NDE4Nn0.eD2IZcW4WI-rR1NVC2CRe1_kX3bBVGb3j-HTti2c2-4"}'::jsonb,
      body := jsonb_build_object(
        'scheduled_execution', true,
        'execution_time', now()
      )
    ) as request_id;
  $$
);

-- 2. Programmer les rappels de facturation automatisés (tous les jours à 8h00 UTC)
-- Cela correspond à 9h00 en France en hiver et 10h00 en été
SELECT cron.schedule(
  'automated-billing-reminders-daily',
  '0 8 * * *',  -- Tous les jours à 8h00 UTC
  $$
  SELECT
    net.http_post(
      url := 'https://rhmxohcqyyyglgmtnioc.supabase.co/functions/v1/automated-billing-reminders',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJobXhvaGNxeXl5Z2xnbXRuaW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDgxODYsImV4cCI6MjA2OTQ4NDE4Nn0.eD2IZcW4WI-rR1NVC2CRe1_kX3bBVGb3j-HTti2c2-4"}'::jsonb,
      body := jsonb_build_object(
        'scheduled_execution', true,
        'execution_time', now()
      )
    ) as request_id;
  $$
);