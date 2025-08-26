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
        
        // Fallback avec données basiques
        setData({
          chartData: [],
          insights: [
            {
              title: "Analyse en cours",
              description: "Génération d'insights intelligents en cours...",
              impact: "Moyen"
            }
          ],
          generated_at: new Date().toISOString(),
          type
        });
      } finally {
        setLoading(false);
      }
    };

    // Débounce pour éviter trop d'appels
    const timeoutId = setTimeout(generateInsights, 1500);
    return () => clearTimeout(timeoutId);
  }, [subscriptions, type]);

  return { data, loading, error };
};