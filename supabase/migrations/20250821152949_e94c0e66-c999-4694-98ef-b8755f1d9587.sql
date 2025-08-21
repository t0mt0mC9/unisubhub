-- Supprimer les données du compte contactsonosoul@gmail.com
-- User ID: 5efe0d43-3213-4ddb-8e02-c6c367306b19

-- 1. Supprimer simplement l'entrée referral qui référence cet utilisateur
DELETE FROM referrals WHERE referred_user_id = '5efe0d43-3213-4ddb-8e02-c6c367306b19';

-- 2. Supprimer le profil (cela déclenchera automatiquement la suppression de l'utilisateur auth grâce au ON DELETE CASCADE)
DELETE FROM profiles WHERE id = '5efe0d43-3213-4ddb-8e02-c6c367306b19';

-- 3. Supprimer l'utilisateur directement du schéma auth (au cas où le cascade ne fonctionne pas)
DELETE FROM auth.users WHERE id = '5efe0d43-3213-4ddb-8e02-c6c367306b19';