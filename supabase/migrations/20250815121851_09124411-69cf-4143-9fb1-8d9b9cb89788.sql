-- First drop all triggers that depend on the functions
DROP TRIGGER IF EXISTS on_auth_user_signup_referral ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_referral ON auth.users;

-- Now drop and recreate all referral functions to fix user_id ambiguity completely
DROP FUNCTION IF EXISTS public.check_referral_rewards(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_referral_completion() CASCADE;

-- Recreate check_referral_rewards function with complete table prefixes
CREATE OR REPLACE FUNCTION public.check_referral_rewards(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  completed_referrals INTEGER;
  pending_rewards INTEGER;
BEGIN
  -- Count completed referrals that haven't been rewarded yet
  SELECT COUNT(*) INTO completed_referrals
  FROM public.referrals ref
  WHERE ref.referrer_user_id = target_user_id 
    AND ref.status = 'completed' 
    AND NOT ref.reward_granted;
  
  -- Calculate how many rewards should be granted (2 referrals = 1 reward)
  pending_rewards := completed_referrals / 2;
  
  -- Grant rewards if applicable
  IF pending_rewards > 0 THEN
    -- Mark referrals as rewarded
    UPDATE public.referrals
    SET reward_granted = true, 
        rewarded_at = now(),
        status = 'rewarded'
    WHERE id IN (
      SELECT ref.id 
      FROM public.referrals ref
      WHERE ref.referrer_user_id = target_user_id 
        AND ref.status = 'completed' 
        AND NOT ref.reward_granted
      ORDER BY ref.completed_at ASC
      LIMIT (pending_rewards * 2)
    );
    
    -- Update subscriber table to extend subscription (only if user has subscription)
    UPDATE public.subscribers sub
    SET subscription_end = COALESCE(
      CASE 
        WHEN sub.subscription_end > now() THEN sub.subscription_end + (pending_rewards || ' months')::INTERVAL
        ELSE now() + (pending_rewards || ' months')::INTERVAL
      END,
      now() + (pending_rewards || ' months')::INTERVAL
    )
    WHERE sub.user_id = target_user_id;
  END IF;
END;
$function$;

-- Recreate handle_referral_completion function with complete table prefixes
CREATE OR REPLACE FUNCTION public.handle_referral_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if this user was referred by someone
  UPDATE public.referrals
  SET referred_user_id = NEW.id,
      status = 'completed',
      completed_at = now()
  WHERE referred_email = NEW.email
    AND status = 'pending';
  
  -- Only check for rewards if there were any referrals updated
  IF FOUND THEN
    -- Check for rewards for all referrers - with explicit function parameter
    PERFORM public.check_referral_rewards(ref.referrer_user_id)
    FROM public.referrals ref
    WHERE ref.referred_user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for referral completion
CREATE TRIGGER on_auth_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_referral_completion();