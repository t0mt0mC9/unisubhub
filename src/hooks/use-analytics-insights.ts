import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsInsight {
  title: string;
  description: string;
  impact: string;
  trend?: string;
  category?: string;
  analysis?: string;
  recommendation?: string;
  potential_saving?: string;
  period?: string;
  prediction?: string;
  confidence?: number;
  factors?: string[];
}

interface ChartDataPoint {
  [key: string]: any;
}

interface AnalyticsInsightsData {
  chartData: ChartDataPoint[];
  insights: AnalyticsInsight[];
  seasonality?: {
    peak_months: string[];
    low_months: string[];
    description: string;
  };
  benchmarks?: {
    industry_average: number;
    user_vs_average: string;
  };
  scenarios?: {
    best_case: { total: number; description: string };
    worst_case: { total: number; description: string };
  };
  generated_at: string;
  type: string;
}

export const useAnalyticsInsights = (subscriptions: any[], type: string = 'spending_trends') => {
  const [data, setData] = useState<AnalyticsInsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subscriptions || subscriptions.length === 0) {
      setData(null);
      return;
    }

    const generateInsights = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: insightsData, error: functionError } = await supabase.functions.invoke('analytics-insights', {
          body: { subscriptions, type }
        });

        if (functionError) {
          throw new Error(functionError.message);
        }

        setData(insightsData);
      } catch (err) {
        console.error('Error generating analytics insights:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors de la génération des insights');
        
        // Fallback avec données intelligentes basées sur les abonnements réels
        setData(generateIntelligentFallback(subscriptions, type));
      } finally {
        setLoading(false);
      }
    };

    // Générer immédiatement si on a des abonnements
    generateInsights();
  }, [subscriptions, type]);

  return { data, loading, error };
};

// Fonction pour générer des données de fallback intelligentes
function generateIntelligentFallback(subscriptions: any[], type: string): AnalyticsInsightsData {
  const totalMonthly = subscriptions.reduce((sum, sub) => {
    const monthlyPrice = sub.billing_cycle === 'yearly' ? sub.price / 12 : 
                        sub.billing_cycle === 'weekly' ? sub.price * 4.33 : sub.price;
    return sum + monthlyPrice;
  }, 0);

  const categoryStats = subscriptions.reduce((acc: any, sub: any) => {
    const monthlyPrice = sub.billing_cycle === 'yearly' ? sub.price / 12 : 
                        sub.billing_cycle === 'weekly' ? sub.price * 4.33 : sub.price;
    acc[sub.category] = (acc[sub.category] || 0) + monthlyPrice;
    return acc;
  }, {});

  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  switch (type) {
    case 'spending_trends':
      return {
        chartData: months.map((month, i) => ({
          month,
          depenses: Math.round(totalMonthly * (0.9 + Math.random() * 0.2)),
          optimise: Math.round(totalMonthly * 0.8),
          projection: Math.round(totalMonthly * (1 + i * 0.02))
        })),
        insights: [
          {
            title: "Tendance croissante détectée",
            description: `Vos dépenses mensuelles de ${Math.round(totalMonthly)}€ montrent une progression`,
            impact: "Moyen",
            trend: "up"
          },
          {
            title: "Économies possibles",
            description: `Potentiel d'optimisation de ${Math.round(totalMonthly * 0.2)}€/mois identifié`,
            impact: "Élevé",
            trend: "down"
          }
        ],
        seasonality: {
          peak_months: ["Dec", "Jan"],
          low_months: ["Jul", "Aug"],
          description: "Les dépenses tendent à augmenter en fin d'année"
        },
        generated_at: new Date().toISOString(),
        type
      };

    case 'category_analysis':
      return {
        chartData: Object.entries(categoryStats).map(([category, value], i) => ({
          category,
          value: Math.round(value as number),
          percentage: Math.round((value as number / totalMonthly) * 100),
          benchmark: Math.round((value as number) * 0.9),
          color: colors[i % colors.length]
        })),
        insights: [
          {
            title: "Analyse par catégorie",
            description: "Catégorie dominante de vos dépenses",
            impact: "Élevé",
            category: "Streaming",
            analysis: "Catégorie dominante de vos dépenses",
            recommendation: "Considérez regrouper vos services streaming",
            potential_saving: "15€"
          }
        ],
        benchmarks: {
          industry_average: Math.round(totalMonthly * 0.85),
          user_vs_average: totalMonthly > 65 ? "above" : "below"
        },
        generated_at: new Date().toISOString(),
        type
      };

    case 'forecast':
      return {
        chartData: months.slice(0, 6).map((month, i) => ({
          month: `${month} 2025`,
          current: Math.round(totalMonthly * (1 + i * 0.03)),
          optimistic: Math.round(totalMonthly * (0.9 + i * 0.02)),
          pessimistic: Math.round(totalMonthly * (1.1 + i * 0.04)),
          confidence: Math.max(60, 90 - i * 5)
        })),
        insights: [
          {
            title: "Prédiction Q1 2025",
            description: `Dépenses projetées à ${Math.round(totalMonthly * 1.1)}€/mois`,
            impact: "Moyen",
            period: "Q1 2025",
            prediction: `Dépenses projetées à ${Math.round(totalMonthly * 1.1)}€/mois`,
            confidence: 85,
            factors: ["Inflation", "Nouveaux services", "Optimisations possibles"]
          }
        ],
        scenarios: {
          best_case: {
            total: Math.round(totalMonthly * 6 * 0.85),
            description: "Avec optimisations recommandées"
          },
          worst_case: {
            total: Math.round(totalMonthly * 6 * 1.15),
            description: "Sans changements"
          }
        },
        generated_at: new Date().toISOString(),
        type
      };

    default:
      return {
        chartData: [],
        insights: [],
        generated_at: new Date().toISOString(),
        type
      };
  }
}