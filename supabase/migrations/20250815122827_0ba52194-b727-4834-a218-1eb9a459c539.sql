-- Modify the existing handle_new_user function to also send UniSubHub confirmation email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  confirmation_link text;
BEGIN
  -- First, create the profile as before
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  
  -- Then send the UniSubHub confirmation email
  IF NEW.email_confirmed_at IS NULL AND NEW.email IS NOT NULL THEN
    BEGIN
      -- Create a proper confirmation link using Supabase's format
      confirmation_link := 'https://rhmxohcqyyyglgmtnioc.supabase.co/auth/v1/verify?token=' || 
                           encode(gen_random_bytes(32), 'base64url') || 
                           '&type=signup&redirect_to=https://c6cdb938-7790-42f1-abd3-9729bbdbc721.lovableproject.com/';
      
      -- Use pg_net to call our edge function
      PERFORM
        net.http_post(
          url := 'https://rhmxohcqyyyglgmtnioc.supabase.co/functions/v1/send-confirmation-email',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
          ),
          body := jsonb_build_object(
            'email', NEW.email,
            'confirmation_link', confirmation_link
          )
        );
      
      RAISE NOTICE 'UniSubHub confirmation email triggered for: %', NEW.email;
      
    EXCEPTION
      WHEN others THEN
        -- Don't block user creation if email fails
        RAISE WARNING 'Failed to send UniSubHub email for %: %', NEW.email, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;