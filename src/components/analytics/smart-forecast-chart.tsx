import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { useAnalyticsInsights } from "@/hooks/use-analytics-insights";
import { Zap, Sparkles, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface SmartForecastChartProps {
  subscriptions: any[];
}

export const SmartForecastChart = ({ subscriptions }: SmartForecastChartProps) => {
  const { data, loading, error } = useAnalyticsInsights(subscriptions, 'forecast');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Prédictions intelligentes
          </CardTitle>
          <CardDescription>Génération de prévisions par IA...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Très fiable';
    if (confidence >= 60) return 'Modérée';
    return 'Incertaine';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Prédictions intelligentes
          <Badge variant="outline" className="ml-auto">IA Perplexity</Badge>
        </CardTitle>
        <CardDescription>
          Prévisions basées sur l'analyse du marché et vos habitudes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data?.chartData && data.chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="optimisticGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="pessimisticGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                
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
                    name === 'current' ? 'Tendance actuelle' :
                    name === 'optimistic' ? 'Scénario optimiste' :
                    name === 'pessimistic' ? 'Scénario pessimiste' :
                    name === 'confidence' ? `Confiance: ${value}%` : name
                  ]}
                />
                <Legend />
                
                <Area
                  type="monotone"
                  dataKey="pessimistic"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  fill="url(#pessimisticGradient)"
                  name="Scénario pessimiste"
                  strokeDasharray="8 4"
                />
                <Area
                  type="monotone"
                  dataKey="optimistic"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  fill="url(#optimisticGradient)"
                  name="Scénario optimiste"
                  strokeDasharray="4 4"
                />
                <Area
                  type="monotone"
                  dataKey="current"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fill="url(#currentGradient)"
                  name="Tendance actuelle"
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Scénarios */}
            {data?.scenarios && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <h4 className="font-medium text-sm">Scénario optimiste</h4>
                  </div>
                  <div className="text-2xl font-bold text-success mb-1">
                    {Math.round(data.scenarios.best_case.total)}€
                  </div>
                   <p className="text-xs text-muted-foreground">
                     {data.scenarios.best_case.description}
                   </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-warning/10 to-destructive/10 rounded-lg border border-warning/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-warning" />
                    <h4 className="font-medium text-sm">Scénario pessimiste</h4>
                  </div>
                  <div className="text-2xl font-bold text-destructive mb-1">
                    {Math.round(data.scenarios.worst_case.total)}€
                  </div>
                   <p className="text-xs text-muted-foreground">
                     {data.scenarios.worst_case.description}
                   </p>
                </div>
              </div>
            )}

            {/* Insights de prédiction */}
            {data?.insights && data.insights.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Prédictions IA
                </h4>
                {data.insights.map((insight, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg bg-muted/50 border"
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium text-sm">{insight.period}</h5>
                          {insight.confidence && (
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={insight.confidence} 
                                className="w-16 h-2"
                              />
                              <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                                {getConfidenceLabel(insight.confidence)}
                              </span>
                            </div>
                          )}
                        </div>
                         <p className="text-sm text-muted-foreground mb-2">
                           {insight.prediction}
                         </p>
                        {insight.factors && insight.factors.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {insight.factors.map((factor, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Génération de prédictions en cours...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};