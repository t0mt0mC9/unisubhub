-- Créer ou mettre à jour le profil pour tom.lifert@gmail.com et activer le consentement AI
INSERT INTO public.profiles (id, email, ai_insights_consent, privacy_settings)
VALUES ('750929e9-09e0-4c24-8e21-a34a324acf6e', 'tom.lifert@gmail.com', true, '{"analytics": true, "personalization": true}')
ON CONFLICT (id) 
DO UPDATE SET 
  ai_insights_consent = true,
  privacy_settings = '{"analytics": true, "personalization": true}',
  updated_at = now();