-- Configuration des tâches cron pour automatiser les notifications

-- 1. Activer les extensions nécessaires pour les cron jobs
-- Ces extensions sont généralement déjà activées dans Supabase
-- Si elles ne le sont pas, les activer depuis l'interface Supabase

-- 2. Programmer les alertes budget automatisées (tous les dimanches à 9h00 UTC)
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

-- 3. Programmer les rappels de facturation automatisés (tous les jours à 8h00 UTC)
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

-- 4. Visualiser les tâches cron actives (pour vérification)
-- SELECT * FROM cron.job;

-- 5. Pour supprimer une tâche cron si nécessaire (décommentez si besoin)
-- SELECT cron.unschedule('automated-budget-alerts-sunday');
-- SELECT cron.unschedule('automated-billing-reminders-daily');