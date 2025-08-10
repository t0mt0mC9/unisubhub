-- Fix security warnings: Add search_path to functions
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_referral_rewards(user_id UUID)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  completed_referrals INTEGER;
  pending_rewards INTEGER;
BEGIN
  -- Count completed referrals that haven't been rewarded yet
  SELECT COUNT(*) INTO completed_referrals
  FROM public.referrals
  WHERE referrer_user_id = user_id 
    AND status = 'completed' 
    AND NOT reward_granted;
  
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
      SELECT id 
      FROM public.referrals 
      WHERE referrer_user_id = user_id 
        AND status = 'completed' 
        AND NOT reward_granted
      ORDER BY completed_at ASC
      LIMIT (pending_rewards * 2)
    );
    
    -- Update subscriber table to extend subscription
    UPDATE public.subscribers
    SET subscription_end = COALESCE(
      CASE 
        WHEN subscription_end > now() THEN subscription_end + (pending_rewards || ' months')::INTERVAL
        ELSE now() + (pending_rewards || ' months')::INTERVAL
      END,
      now() + (pending_rewards || ' months')::INTERVAL
    )
    WHERE user_id = user_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_referral_completion()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if this user was referred by someone
  UPDATE public.referrals
  SET referred_user_id = NEW.id,
      status = 'completed',
      completed_at = now()
  WHERE referred_email = NEW.email
    AND status = 'pending';
  
  -- Check for rewards for all referrers
  PERFORM public.check_referral_rewards(referrer_user_id)
  FROM public.referrals
  WHERE referred_user_id = NEW.id;
  
  RETURN NEW;
END;
$$;