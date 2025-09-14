import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DynamicRecommendation {
  id: number;
  type: string;
  title: string;
  description: string;
  impact: string;
  details: string;
  potential_savings?: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const useDynamicRecommendations = (subscriptions: any[]) => {
  const [recommendations, setRecommendations] = useState<DynamicRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<{ 
    data: DynamicRecommendation[], 
    timestamp: number, 
    subscriptionsHash: string 
  } | null>(null);

  useEffect(() => {
    if (!subscriptions || subscriptions.length === 0) {
      setRecommendations([]);
      return;
    }

    const generateRecommendations = async () => {
      // Créer un hash des abonnements pour détecter les changements significatifs
      const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
      const subscriptionsHash = JSON.stringify(
        activeSubscriptions.map(sub => ({
          id: sub.id,
          name: sub.name,
          price: sub.price,
          category: sub.category,
          billing_cycle: sub.billing_cycle
        })).sort((a, b) => a.id - b.id)
      );

      // Vérifier le cache (valide pendant 10 minutes)
      const now = Date.now();
      const cacheValid = cacheRef.current && 
        cacheRef.current.subscriptionsHash === subscriptionsHash &&
        (now - cacheRef.current.timestamp) < 10 * 60 * 1000; // 10 minutes

      if (cacheValid) {
        setRecommendations(cacheRef.current!.data);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: functionError } = await supabase.functions.invoke('dynamic-recommendations', {
          body: { subscriptions: activeSubscriptions }
        });

        if (functionError) {
          throw new Error(functionError.message);
        }

        const newRecommendations = data.recommendations || [];
        setRecommendations(newRecommendations);
        
        // Mettre à jour le cache
        cacheRef.current = {
          data: newRecommendations,
          timestamp: now,
          subscriptionsHash
        };

      } catch (err) {
        console.error('Error generating recommendations:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors de la génération des recommandations');
        
        // Utiliser le cache même expiré si disponible
        if (cacheRef.current && cacheRef.current.subscriptionsHash === subscriptionsHash) {
          setRecommendations(cacheRef.current.data);
        } else {
          // Fallback avec recommandations statiques seulement si pas de cache
          setRecommendations([
            {
              id: 1,
              type: "cost",
              title: "Recommandations temporairement indisponibles",
              description: "Service en cours de maintenance",
              impact: "Info",
              details: "Les recommandations seront bientôt disponibles.",
              icon: "Clock",
              color: "text-gray-600",
              bgColor: "bg-gray-100"
            }
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    // Débounce pour éviter trop d'appels
    const timeoutId = setTimeout(generateRecommendations, 1000);
    return () => clearTimeout(timeoutId);
  }, [subscriptions]);

  return { recommendations, loading, error };
};