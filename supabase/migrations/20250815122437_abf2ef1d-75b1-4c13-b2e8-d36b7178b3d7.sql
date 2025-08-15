-- Create webhook to automatically send UniSubHub confirmation emails
-- This will trigger our auth-webhook function whenever a new user signs up

-- First, let's create the webhook configuration
INSERT INTO supabase_functions.hooks (
  hook_table_id, 
  hook_name, 
  type, 
  function_name,
  function_args
) VALUES (
  (SELECT id FROM supabase_functions.tables WHERE schema = 'auth' AND name = 'users'),
  'send_unisubhub_confirmation_email',
  'after_insert',
  'auth-webhook',
  '{}'
) ON CONFLICT (hook_table_id, hook_name) DO UPDATE SET
  type = EXCLUDED.type,
  function_name = EXCLUDED.function_name,
  function_args = EXCLUDED.function_args;