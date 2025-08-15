-- Create a trigger that will automatically send UniSubHub confirmation emails
-- when a new user signs up

CREATE OR REPLACE FUNCTION public.send_unisubhub_confirmation_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  confirmation_link text;
  email_result jsonb;
BEGIN
  -- Only process if this is a new signup (not email confirmed yet)
  IF NEW.email_confirmed_at IS NULL AND NEW.email IS NOT NULL THEN
    BEGIN
      -- Create a professional confirmation link
      confirmation_link := 'https://rhmxohcqyyyglgmtnioc.supabase.co/auth/v1/verify?token=' || 
                           encode(gen_random_bytes(32), 'base64url') || 
                           '&type=signup&redirect_to=https://c6cdb938-7790-42f1-abd3-9729bbdbc721.lovableproject.com/';
      
      -- Call our edge function to send the UniSubHub email
      SELECT content::jsonb INTO email_result
      FROM http((
        'POST',
        'https://rhmxohcqyyyglgmtnioc.supabase.co/functions/v1/send-confirmation-email',
        ARRAY[
          http_header('authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)),
          http_header('content-type', 'application/json')
        ],
        'application/json',
        json_build_object(
          'email', NEW.email,
          'confirmation_link', confirmation_link
        )::text
      ));
      
      -- Log the result
      RAISE NOTICE 'UniSubHub confirmation email sent for user: %, result: %', NEW.email, email_result;
      
    EXCEPTION WHEN OTHERS THEN
      -- Don't fail the signup if email sending fails
      RAISE WARNING 'Failed to send UniSubHub confirmation email for user %: %', NEW.email, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS send_unisubhub_email_on_signup ON auth.users;
CREATE TRIGGER send_unisubhub_email_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_unisubhub_confirmation_email();