-- Improve the referral code generation function to ensure uniqueness
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
  attempts INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  LOOP
    -- Generate a new code
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if this code already exists
    IF NOT EXISTS (SELECT 1 FROM public.referrals WHERE referral_code = result) THEN
      RETURN result;
    END IF;
    
    -- Increment attempts counter
    attempts := attempts + 1;
    
    -- Exit if we've tried too many times
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Unable to generate unique referral code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$;