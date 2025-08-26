-- Activer les extensions nécessaires pour les tâches cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Programmer l'envoi de rappels d'essai chaque jour à 10h00 (UTC)
SELECT cron.schedule(
  'trial-reminder-daily',
  '0 10 * * *', -- 10h00 UTC chaque jour
  $$
  SELECT
    net.http_post(
        url:='https://rhmxohcqyyyglgmtnioc.supabase.co/functions/v1/trial-reminder',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJobXhvaGNxeXl5Z2xnbXRuaW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDgxODYsImV4cCI6MjA2OTQ4NDE4Nn0.eD2IZcW4WI-rR1NVC2CRe1_kX3bBVGb3j-HTti2c2-4"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);