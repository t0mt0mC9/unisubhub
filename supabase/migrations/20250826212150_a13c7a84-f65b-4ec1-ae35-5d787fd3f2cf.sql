-- Enable pg_cron and pg_net extensions for scheduled tasks
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Create a cron job to update Dealabs offers daily at 6 AM
select cron.schedule(
  'daily-dealabs-offers-update',
  '0 6 * * *', -- Every day at 6 AM
  $$
  select
    net.http_post(
        url:='https://rhmxohcqyyyglgmtnioc.supabase.co/functions/v1/daily-offers-update',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJobXhvaGNxeXl5Z2xnbXRuaW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDgxODYsImV4cCI6MjA2OTQ4NDE4Nn0.eD2IZcW4WI-rR1NVC2CRe1_kX3bBVGb3j-HTti2c2-4"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);