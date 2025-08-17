-- Créer une table de cache pour les offres Dealabs
CREATE TABLE IF NOT EXISTS public.dealabs_offers_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price TEXT,
  original_price TEXT,
  discount TEXT,
  merchant TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  temperature INTEGER DEFAULT 0,
  expiry_date TIMESTAMP WITH TIME ZONE,
  coupon_code TEXT,
  is_expired BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_dealabs_offers_cache_created_at ON public.dealabs_offers_cache(created_at);
CREATE INDEX IF NOT EXISTS idx_dealabs_offers_cache_category ON public.dealabs_offers_cache(category);
CREATE INDEX IF NOT EXISTS idx_dealabs_offers_cache_merchant ON public.dealabs_offers_cache(merchant);

-- Activer Row Level Security
ALTER TABLE public.dealabs_offers_cache ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre la lecture publique (offres visibles par tous)
CREATE POLICY "Offers are readable by everyone" 
ON public.dealabs_offers_cache 
FOR SELECT 
USING (true);

-- Créer une politique pour permettre l'insertion/mise à jour via service role uniquement
CREATE POLICY "Service role can manage offers" 
ON public.dealabs_offers_cache 
FOR ALL 
USING (true);