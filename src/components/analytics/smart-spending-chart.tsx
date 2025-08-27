import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { useAnalyticsInsights } from "@/hooks/use-analytics-insights";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SmartSpendingChartProps {
  subscriptions: any[];
}

export const SmartSpendingChart = ({ subscriptions }: SmartSpendingChartProps) => {
  const { data, loading, error } = useAnalyticsInsights(subscriptions, 'spending_trends');

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-destructive" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-success" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'élevé': return 'destructive';
      case 'moyen': return 'default';
      case 'faible': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Analyse intelligente des tendances
          </CardTitle>
          <CardDescription>Génération d'insights par IA...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Analyse intelligente des tendances
          <Badge variant="outline" className="ml-auto">IA Perplexity</Badge>
        </CardTitle>
        <CardDescription>
          Projection et optimisation basées sur l'analyse du marché
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data?.chartData && data.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}€`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: string) => [
                  `${Math.round(value)}€`,
                  name === 'depenses' ? 'Dépenses actuelles' :
                  name === 'optimise' ? 'Potentiel optimisé' :
                  name === 'projection' ? 'Projection' : name
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="depenses" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                name="Dépenses actuelles"
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="optimise" 
                stroke="hsl(var(--chart-2))" 
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Potentiel optimisé"
                dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="projection" 
                stroke="hsl(var(--chart-3))" 
                strokeDasharray="10 5"
                strokeWidth={2}
                name="Projection IA"
                dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Analyse en cours...</p>
            </div>
          </div>
        )}

        {/* Insights intelligents */}
        {data?.insights && data.insights.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Insights IA
            </h4>
            {data.insights.slice(0, 3).map((insight, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-muted"
              >
                {insight.trend && getTrendIcon(insight.trend)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-sm">{insight.title}</h5>
                    <Badge variant={getImpactColor(insight.impact)} className="text-xs">
                      {insight.impact}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Saisonnalité */}
        {data?.seasonality && (
          <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Analyse saisonnière
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              {data.seasonality.description}
            </p>
            <div className="flex gap-4 text-xs">
              <div>
                <span className="font-medium">Pics: </span>
                <span className="text-muted-foreground">
                  {data.seasonality.peak_months.join(', ')}
                </span>
              </div>
              <div>
                <span className="font-medium">Creux: </span>
                <span className="text-muted-foreground">
                  {data.seasonality.low_months.join(', ')}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};