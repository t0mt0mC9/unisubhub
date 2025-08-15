-- Fix ambiguous user_id reference in handle_referral_completion function
CREATE OR REPLACE FUNCTION public.handle_referral_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Check if this user was referred by someone
  UPDATE public.referrals
  SET referred_user_id = NEW.id,
      status = 'completed',
      completed_at = now()
  WHERE referred_email = NEW.email
    AND status = 'pending';
  
  -- Check for rewards for all referrers - fix ambiguous user_id reference
  PERFORM public.check_referral_rewards(r.referrer_user_id)
  FROM public.referrals r
  WHERE r.referred_user_id = NEW.id;
  
  RETURN NEW;
END;
$function$;

-- Fix ambiguous user_id reference in check_referral_rewards function  
CREATE OR REPLACE FUNCTION public.check_referral_rewards(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  completed_referrals INTEGER;
  pending_rewards INTEGER;
BEGIN
  -- Count completed referrals that haven't been rewarded yet
  SELECT COUNT(*) INTO completed_referrals
  FROM public.referrals r
  WHERE r.referrer_user_id = user_id 
    AND r.status = 'completed' 
    AND NOT r.reward_granted;
  
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
      SELECT r.id 
      FROM public.referrals r
      WHERE r.referrer_user_id = user_id 
        AND r.status = 'completed' 
        AND NOT r.reward_granted
      ORDER BY r.completed_at ASC
      LIMIT (pending_rewards * 2)
    );
    
    -- Update subscriber table to extend subscription
    UPDATE public.subscribers s
    SET subscription_end = COALESCE(
      CASE 
        WHEN s.subscription_end > now() THEN s.subscription_end + (pending_rewards || ' months')::INTERVAL
        ELSE now() + (pending_rewards || ' months')::INTERVAL
      END,
      now() + (pending_rewards || ' months')::INTERVAL
    )
    WHERE s.user_id = user_id;
  END IF;
END;
$function$;