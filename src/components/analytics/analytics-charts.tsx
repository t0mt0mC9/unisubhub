import { SmartCategoryChart } from "./smart-category-chart";
import { SmartForecastChart } from "./smart-forecast-chart";
import { MonthlyProjectionChart } from "./monthly-projection-chart";

interface AnalyticsChartsProps {
  subscriptions: any[];
}

export const AnalyticsCharts = ({ subscriptions }: AnalyticsChartsProps) => {
  return (
    <div className="space-y-8">
      {/* Projection des dépenses mensuelles */}
      <MonthlyProjectionChart subscriptions={subscriptions} />
      
      {/* Analyse par catégorie avec benchmarks */}
      <SmartCategoryChart subscriptions={subscriptions} />
      
      {/* Prédictions et forecasts */}
      <SmartForecastChart subscriptions={subscriptions} />
    </div>
  );
};