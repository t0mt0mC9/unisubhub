import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp } from "lucide-react";

interface MonthlyProjectionChartProps {
  subscriptions: any[];
}

export const MonthlyProjectionChart = ({ subscriptions }: MonthlyProjectionChartProps) => {
  
  // Fonction pour calculer les projections des 12 prochains mois
  const calculateMonthlyProjections = () => {
    const projections = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthName = targetMonth.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      
      let monthlyTotal = 0;
      
      subscriptions.forEach(sub => {
        if (sub.status !== 'active') return;
        
        const nextBillingDate = new Date(sub.next_billing_date);
        const billingCycle = sub.billing_cycle;
        const price = parseFloat(sub.price) || 0;
        
        // Calculer si cet abonnement aura une facturation ce mois-ci
        let willBeBilled = false;
        
        if (billingCycle === 'monthly') {
          // Pour les abonnements mensuels, ils sont facturés chaque mois
          willBeBilled = true;
        } else if (billingCycle === 'yearly') {
          // Pour les abonnements annuels, vérifier si c'est le bon mois
          const billingMonth = nextBillingDate.getMonth();
          const targetMonthNum = targetMonth.getMonth();
          
          // Ajuster pour les années futures
          const yearsDiff = targetMonth.getFullYear() - nextBillingDate.getFullYear();
          const monthsDiff = (yearsDiff * 12) + (targetMonthNum - billingMonth);
          
          willBeBilled = monthsDiff % 12 === 0 && monthsDiff >= 0;
        } else if (billingCycle === 'weekly') {
          // Pour les abonnements hebdomadaires, approximation : ~4.33 fois par mois
          monthlyTotal += price * 4.33;
          return; // Skip le reste de la logique
        }
        
        if (willBeBilled) {
          monthlyTotal += price;
        }
      });
      
      projections.push({
        month: monthName,
        amount: parseFloat(monthlyTotal.toFixed(2)),
        subscriptionsCount: subscriptions.filter(s => s.status === 'active').length
      });
    }
    
    return projections;
  };

  // Utiliser useMemo pour optimiser les calculs et forcer la mise à jour
  const projectionData = useMemo(() => calculateMonthlyProjections(), [subscriptions]);
  
  // Calculer les statistiques avec useMemo pour performance
  const stats = useMemo(() => {
    const avgMonthly = projectionData.reduce((sum, month) => sum + month.amount, 0) / projectionData.length;
    const maxMonth = Math.max(...projectionData.map(m => m.amount));
    const minMonth = Math.min(...projectionData.map(m => m.amount));
    return { avgMonthly, maxMonth, minMonth };
  }, [projectionData]);

  const formatTooltip = (value: any, name: string) => {
    if (name === 'amount') {
      return [`${value}€`, 'Dépenses prévues'];
    }
    return [value, name];
  };

  const formatYAxis = (value: number) => `${value}€`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Projection des dépenses mensuelles
        </CardTitle>
        <CardDescription>
          Prévisions basées sur vos cycles de facturation actuels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Moyenne mensuelle</div>
            <div className="text-lg font-semibold text-primary">{stats.avgMonthly.toFixed(2)}€</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Mois le plus élevé</div>
            <div className="text-lg font-semibold text-destructive">{stats.maxMonth.toFixed(2)}€</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Mois le plus bas</div>
            <div className="text-lg font-semibold text-success">{stats.minMonth.toFixed(2)}€</div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                fontSize={12}
                tick={{ fill: 'currentColor' }}
                axisLine={{ stroke: 'currentColor', opacity: 0.5 }}
              />
              <YAxis 
                tickFormatter={formatYAxis}
                fontSize={12}
                tick={{ fill: 'currentColor' }}
                axisLine={{ stroke: 'currentColor', opacity: 0.5 }}
              />
              <Tooltip 
                formatter={formatTooltip}
                labelClassName="text-foreground"
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--card-foreground))'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>
            Projection basée sur {subscriptions.filter(s => s.status === 'active').length} abonnements actifs
          </span>
        </div>
      </CardContent>
    </Card>
  );
};