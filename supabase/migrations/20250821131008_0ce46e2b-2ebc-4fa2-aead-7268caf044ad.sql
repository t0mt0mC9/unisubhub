-- Créer ou mettre à jour l'entrée pour tom.lifert@gmail.com
INSERT INTO public.subscribers (
  email, 
  user_id, 
  stripe_customer_id, 
  subscribed, 
  subscription_tier, 
  subscription_type, 
  subscription_end,
  updated_at
) VALUES (
  'tom.lifert@gmail.com',
  '750929e9-09e0-4c24-8e21-a34a324acf6e',
  NULL,
  true,
  'Premium',
  'lifetime',
  NULL,
  now()
) ON CONFLICT (email) 
DO UPDATE SET 
  subscribed = true,
  subscription_tier = 'Premium',
  subscription_type = 'lifetime',
  subscription_end = NULL,
  updated_at = now();