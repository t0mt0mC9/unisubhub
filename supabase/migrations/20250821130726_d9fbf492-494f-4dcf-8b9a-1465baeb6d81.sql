-- Mettre à jour le compte tom.lifert@gmail.com avec un plan à vie
UPDATE public.subscribers 
SET 
  subscribed = true,
  subscription_tier = 'Premium',
  subscription_type = 'lifetime',
  subscription_end = NULL,
  updated_at = now()
WHERE email = 'tom.lifert@gmail.com';