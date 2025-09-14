import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (!subscriptions || subscriptions.length === 0) {
      setRecommendations([]);
      return;
    }

    const generateRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        // Filtrer uniquement les abonnements actifs
        const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
        
        const { data, error: functionError } = await supabase.functions.invoke('dynamic-recommendations', {
          body: { subscriptions: activeSubscriptions }
        });

        if (functionError) {
          throw new Error(functionError.message);
        }

        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error('Error generating recommendations:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors de la génération des recommandations');
        
        // Fallback avec recommandations statiques
        setRecommendations([
          {
            id: 1,
            type: "cost",
            title: "Analyse des coûts en cours",
            description: "Vérification des prix du marché en cours...",
            impact: "Moyen",
            details: "Les recommandations détaillées seront disponibles sous peu.",
            icon: "Euro",
            color: "text-blue-600",
            bgColor: "bg-blue-100"
          }
        ]);
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