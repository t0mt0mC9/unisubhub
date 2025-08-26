import { SmartSpendingChart } from "./smart-spending-chart";
import { SmartCategoryChart } from "./smart-category-chart";
import { SmartForecastChart } from "./smart-forecast-chart";

interface AnalyticsChartsProps {
  subscriptions: any[];
}

export const AnalyticsCharts = ({ subscriptions }: AnalyticsChartsProps) => {
  return (
    <div className="space-y-8">
      {/* Analyse intelligente des tendances */}
      <SmartSpendingChart subscriptions={subscriptions} />
      
      {/* Analyse par catégorie avec benchmarks */}
      <SmartCategoryChart subscriptions={subscriptions} />
      
      {/* Prédictions et forecasts */}
      <SmartForecastChart subscriptions={subscriptions} />
    </div>
  );
};