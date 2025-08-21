-- Renforcer la sécurité de la table subscribers

-- Supprimer les anciennes politiques pour les recréer avec une sécurité renforcée
DROP POLICY IF EXISTS "Users can only view their own subscription data" ON public.subscribers;
DROP POLICY IF EXISTS "Users can only update their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can only insert their own subscription" ON public.subscribers;

-- Créer une politique SELECT plus restrictive qui bloque l'accès aux utilisateurs non authentifiés
CREATE POLICY "authenticated_users_select_own_subscription" ON public.subscribers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Créer une politique INSERT plus stricte
CREATE POLICY "authenticated_users_insert_own_subscription" ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Créer une politique UPDATE plus stricte
CREATE POLICY "authenticated_users_update_own_subscription" ON public.subscribers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ajouter une politique DELETE manquante pour permettre aux utilisateurs de supprimer leurs propres données
CREATE POLICY "authenticated_users_delete_own_subscription" ON public.subscribers
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- S'assurer que RLS est activé
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Révoquer tous les privilèges publics pour être sûr
REVOKE ALL ON public.subscribers FROM public;
REVOKE ALL ON public.subscribers FROM anon;

-- Accorder uniquement les privilèges nécessaires aux utilisateurs authentifiés
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscribers TO authenticated;