-- Créer la table de cache pour les recommandations
CREATE TABLE public.recommendations_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscriptions_hash TEXT NOT NULL,
  recommendations_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX idx_recommendations_cache_user_hash ON public.recommendations_cache(user_id, subscriptions_hash);
CREATE INDEX idx_recommendations_cache_created_at ON public.recommendations_cache(created_at);

-- RLS policies
ALTER TABLE public.recommendations_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own recommendations cache" 
ON public.recommendations_cache 
FOR ALL
USING (auth.uid() = user_id);

-- Trigger pour nettoyer automatiquement les anciens caches (plus de 24h)
CREATE OR REPLACE FUNCTION public.cleanup_old_recommendations_cache()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Supprimer les caches de plus de 24h
  DELETE FROM public.recommendations_cache 
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_cleanup_recommendations_cache
  AFTER INSERT ON public.recommendations_cache
  EXECUTE FUNCTION public.cleanup_old_recommendations_cache();