-- Create referral system tables
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL,
  referred_email TEXT NOT NULL,
  referred_user_id UUID NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  referral_code TEXT NOT NULL UNIQUE,
  reward_granted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  rewarded_at TIMESTAMP WITH TIME ZONE NULL
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for referrals
CREATE POLICY "Users can view their own referrals" 
ON public.referrals 
FOR SELECT 
USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can create referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK (auth.uid() = referrer_user_id);

CREATE POLICY "Users can update their own referrals" 
ON public.referrals 
FOR UPDATE 
USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

-- Create function to generate unique referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Create function to check and grant rewards
CREATE OR REPLACE FUNCTION public.check_referral_rewards(user_id UUID)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-update referral status when user signs up
CREATE OR REPLACE FUNCTION public.handle_referral_completion()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_signup_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_referral_completion();

-- Create indexes for better performance
CREATE INDEX idx_referrals_referrer_user_id ON public.referrals(referrer_user_id);
CREATE INDEX idx_referrals_referred_email ON public.referrals(referred_email);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_referrals_referral_code ON public.referrals(referral_code);