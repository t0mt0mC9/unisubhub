-- Corriger la fonction de nettoyage du cache avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.cleanup_old_recommendations_cache()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Supprimer les caches de plus de 24h
  DELETE FROM public.recommendations_cache 
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  RETURN NEW;
END;
$$;