import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAnalyticsInsights } from "@/hooks/use-analytics-insights";
import { Target, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SmartCategoryChartProps {
  subscriptions: any[];
}

export const SmartCategoryChart = ({ subscriptions }: SmartCategoryChartProps) => {
  const { data, loading, error } = useAnalyticsInsights(subscriptions, 'category_analysis');

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Analyse par catégorie
            </CardTitle>
            <CardDescription>Génération d'insights par IA...</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Benchmarks intelligents</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const CHART_COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique en secteurs intelligent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Analyse par catégorie
            <Badge variant="outline" className="ml-auto">IA Perplexity</Badge>
          </CardTitle>
          <CardDescription>
            Répartition optimisée vs actuelle
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.chartData && data.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  label={({category, percentage}) => `${category} ${percentage}%`}
                  labelLine={false}
                >
                  {data.chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `${Math.round(value)}€`,
                    'Dépense mensuelle'
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Analyse en cours...</p>
              </div>
            </div>
          )}

          {/* Légende personnalisée avec benchmark */}
          {data?.chartData && (
            <div className="mt-4 space-y-2">
              {data.chartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color || CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{Math.round(item.value)}€</div>
                    {item.benchmark && (
                      <div className="text-xs text-muted-foreground">
                        vs {Math.round(item.benchmark)}€ marché
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparaison benchmark */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-chart-2" />
            Benchmarks intelligents
          </CardTitle>
          <CardDescription>
            Comparaison avec les moyennes du marché
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.chartData && data.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.chartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  dataKey="category" 
                  type="category" 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `${Math.round(value)}€`,
                    name === 'value' ? 'Votre dépense' : 'Moyenne marché'
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--primary))" 
                  name="Votre dépense"
                  radius={[0, 4, 4, 0]}
                />
                <Bar 
                  dataKey="benchmark" 
                  fill="hsl(var(--chart-2))" 
                  name="Moyenne marché"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Analyse comparative en cours...</p>
              </div>
            </div>
          )}

          {/* Insights par catégorie */}
          {data?.insights && data.insights.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Recommandations IA
              </h4>
              {data.insights.slice(0, 2).map((insight, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg bg-gradient-to-r from-warning/10 to-destructive/10 border border-warning/20"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-sm">{insight.category}</h5>
                        {insight.potential_saving && (
                          <Badge variant="secondary" className="text-xs">
                            -{insight.potential_saving}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {insight.analysis}
                      </p>
                      <p className="text-xs font-medium text-warning">
                        💡 {insight.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Benchmark global */}
          {data?.benchmarks && (
            <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Comparaison globale</span>
                <Badge 
                  variant={
                    data.benchmarks.user_vs_average === 'below' ? 'default' :
                    data.benchmarks.user_vs_average === 'above' ? 'destructive' : 'secondary'
                  }
                  className="text-xs"
                >
                  {data.benchmarks.user_vs_average === 'below' ? '✅ Sous la moyenne' :
                   data.benchmarks.user_vs_average === 'above' ? '⚠️ Au-dessus' : '➡️ Dans la moyenne'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Moyenne marché: {data.benchmarks.industry_average}€/mois
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};