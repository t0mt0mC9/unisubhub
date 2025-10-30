-- Ajouter une colonne trial_start_date à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_start_date timestamp with time zone DEFAULT now();

-- Réinitialiser la date d'essai pour tous les utilisateurs existants
UPDATE public.profiles 
SET trial_start_date = now();

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_trial_start_date ON public.profiles(trial_start_date);

-- Commentaire expliquant la colonne
COMMENT ON COLUMN public.profiles.trial_start_date IS 'Date de début de la période d''essai de 14 jours. Peut être réinitialisée pour prolonger l''essai.';