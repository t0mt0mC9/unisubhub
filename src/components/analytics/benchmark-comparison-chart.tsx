import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Lightbulb, AlertTriangle } from "lucide-react";

interface BenchmarkComparisonChartProps {
  subscriptions: any[];
}

// Moyennes du marché par catégorie (en euros mensuels)
const MARKET_AVERAGES = {
  "Streaming": 25,
  "Musique": 12,
  "Productivité": 35,
  "Cloud & Stockage": 18,
  "Gaming": 28,
  "Fitness & Santé": 22,
  "Actualités & Magazines": 15,
  "Éducation": 30,
  "Sécurité": 16,
  "Design & Créativité": 45,
  "Autre": 20
};

export const BenchmarkComparisonChart = ({ subscriptions }: BenchmarkComparisonChartProps) => {
  // Filtrer uniquement les abonnements actifs
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  
  // Calculer les dépenses par catégorie
  const categorySpending = activeSubscriptions.reduce((acc, sub) => {
    const monthlyPrice = sub.billing_cycle === 'yearly' ? sub.price / 12 : 
                        sub.billing_cycle === 'weekly' ? sub.price * 4.33 : sub.price;
    
    if (!acc[sub.category]) {
      acc[sub.category] = 0;
    }
    acc[sub.category] += monthlyPrice;
    return acc;
  }, {} as Record<string, number>);

  // Créer les données pour le graphique avec toutes les catégories
  const chartData = Object.keys(MARKET_AVERAGES).map(category => {
    const userSpending = categorySpending[category] || 0;
    const marketAverage = MARKET_AVERAGES[category as keyof typeof MARKET_AVERAGES];
    const difference = userSpending - marketAverage;
    const percentageDiff = marketAverage > 0 ? ((difference / marketAverage) * 100) : 0;
    
    return {
      category,
      userSpending: parseFloat(userSpending.toFixed(2)),
      marketAverage,
      difference: parseFloat(difference.toFixed(2)),
      percentageDiff: parseFloat(percentageDiff.toFixed(1)),
      hasSubscriptions: userSpending > 0
    };
  }).filter(item => item.hasSubscriptions); // Afficher seulement les catégories où l'utilisateur a des abonnements

  // Calculer les recommandations IA
  const generateRecommendations = () => {
    const recommendations = [];
    
    // Catégorie avec le plus gros dépassement
    const biggestOverspend = chartData
      .filter(item => item.difference > 0)
      .sort((a, b) => (b.difference as number) - (a.difference as number))[0];
    
    if (biggestOverspend && (biggestOverspend.difference as number) > 10) {
      recommendations.push({
        category: biggestOverspend.category,
        type: "overspend",
        message: `Catégorie principale de dépenses`,
        action: "Optimiser les doublons",
        saving: `${(biggestOverspend.difference as number).toFixed(0)}€`
      });
    }
    
    // Détecter les catégories avec beaucoup d'abonnements
    const categoryCount = activeSubscriptions.reduce((acc, sub) => {
      acc[sub.category] = (acc[sub.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const duplicateCategories = Object.entries(categoryCount)
      .filter(([_, count]) => (count as number) > 2)
      .sort(([, a], [, b]) => (b as number) - (a as number));
    
    if (duplicateCategories.length > 0) {
      const [category, count] = duplicateCategories[0];
      const categoryData = chartData.find(item => item.category === category);
      if (categoryData) {
        recommendations.push({
          category,
          type: "duplicate",
          message: `${count} abonnements ${category}`,
          action: "Regrouper ou supprimer",
          saving: `${Math.round((categoryData.userSpending as number) * 0.3)}€`
        });
      }
    }
    
    return recommendations.slice(0, 2);
  };

  const recommendations = generateRecommendations();

  const formatTooltip = (value: any, name: string) => {
    if (name === 'userSpending') {
      return [`${value}€`, 'Votre dépense'];
    } else if (name === 'marketAverage') {
      return [`${value}€`, 'Moyenne marché'];
    }
    return [value, name];
  };

  const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={4} 
          textAnchor="end" 
          fill="hsl(var(--foreground))"
          fontSize="12"
          fontWeight="500"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Benchmarks intelligents
        </CardTitle>
        <CardDescription>
          Comparaison avec les moyennes du marché
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            <div className="h-[300px] w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  layout="horizontal" 
                  margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    type="number" 
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => `${value}€`}
                  />
                  <YAxis 
                    dataKey="category" 
                    type="category" 
                    width={75}
                    tick={<CustomYAxisTick />}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip 
                    formatter={formatTooltip}
                    labelStyle={{ 
                      color: 'hsl(var(--foreground))', 
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--popover-foreground))',
                      fontSize: '14px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                    }}
                    cursor={false}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }}
                    iconType="rect"
                  />
                  <Bar 
                    dataKey="userSpending" 
                    fill="hsl(var(--primary))" 
                    name="Votre dépense"
                    radius={[0, 4, 4, 0]}
                    stroke="hsl(var(--primary))"
                    strokeWidth={1}
                  />
                  <Bar 
                    dataKey="marketAverage" 
                    fill="hsl(var(--muted-foreground))" 
                    name="Moyenne marché"
                    radius={[0, 4, 4, 0]}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                    opacity={0.7}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Statistiques de comparaison */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Total vs marché</div>
                <div className="text-lg font-semibold">
                  {chartData.reduce((sum, item) => sum + item.difference, 0).toFixed(0)}€
                </div>
                <div className="text-xs text-muted-foreground">différence/mois</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Catégories actives</div>
                <div className="text-lg font-semibold text-primary">{chartData.length}</div>
                <div className="text-xs text-muted-foreground">sur {Object.keys(MARKET_AVERAGES).length}</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Au-dessus moyenne</div>
                <div className="text-lg font-semibold text-destructive">
                  {chartData.filter(item => item.difference > 0).length}
                </div>
                <div className="text-xs text-muted-foreground">catégories</div>
              </div>
            </div>

            {/* Recommandations IA */}
            {recommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Recommandations IA
                </h4>
                {recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg bg-gradient-to-r from-warning/10 to-orange/10 border border-warning/20"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium text-sm">{rec.category}</h5>
                          <Badge variant="secondary" className="text-xs">
                            -{rec.saving}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {rec.message}
                        </p>
                        <p className="text-xs font-medium text-warning">
                          💡 {rec.action}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Aucun abonnement actif à analyser</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};