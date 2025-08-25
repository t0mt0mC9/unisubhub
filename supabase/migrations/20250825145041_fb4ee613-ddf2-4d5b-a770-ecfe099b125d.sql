-- Supprimer complètement le système de parrainage

-- Supprimer les triggers et fonctions liés aux parrainages
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_referral_completion();
DROP FUNCTION IF EXISTS public.check_referral_rewards(uuid);
DROP FUNCTION IF EXISTS public.generate_referral_code();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Supprimer la table referrals
DROP TABLE IF EXISTS public.referrals;

-- Recréer la fonction handle_new_user sans la logique de parrainage
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  -- Créer le profil utilisateur
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  
  -- Envoyer l'email de confirmation UniSubHub
  IF NEW.email_confirmed_at IS NULL AND NEW.email IS NOT NULL THEN
    BEGIN
      -- Créer un lien de confirmation
      DECLARE
        confirmation_link text;
      BEGIN
        confirmation_link := 'https://rhmxohcqyyyglgmtnioc.supabase.co/auth/v1/verify?token=' || 
                             encode(gen_random_bytes(32), 'base64url') || 
                             '&type=signup&redirect_to=https://c6cdb938-7790-42f1-abd3-9729bbdbc721.lovableproject.com/';
        
        -- Utiliser pg_net pour appeler notre edge function
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
      END;
      
    EXCEPTION
      WHEN others THEN
        -- Ne pas bloquer la création d'utilisateur si l'email échoue
        RAISE WARNING 'Failed to send UniSubHub email for %: %', NEW.email, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Logger l'erreur mais ne pas bloquer la création d'utilisateur
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();