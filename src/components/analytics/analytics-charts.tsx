import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface AnalyticsChartsProps {
  subscriptions: any[];
}

export const AnalyticsCharts = ({ subscriptions }: AnalyticsChartsProps) => {
  // Calcul du montant total mensuel basé sur les vraies données
  const currentMonthlyTotal = subscriptions.reduce((sum, sub) => {
    const monthlyPrice = sub.billing_cycle === 'yearly' ? sub.price / 12 : 
                        sub.billing_cycle === 'weekly' ? sub.price * 4.33 : sub.price;
    return sum + monthlyPrice;
  }, 0);

  // Données pour le graphique d'évolution mensuelle (avec données réelles pour le mois actuel)
  const monthlyData = [
    { month: "Sep", amount: 0, subscriptions: 0 },
    { month: "Oct", amount: 0, subscriptions: 0 },
    { month: "Nov", amount: 0, subscriptions: 0 },
    { month: "Déc", amount: 0, subscriptions: 0 },
    { month: "Jan", amount: 0, subscriptions: 0 },
    { month: "Fév", amount: currentMonthlyTotal, subscriptions: subscriptions.length },
  ];

  // Données par catégorie pour le graphique en secteurs
  const categoryData = subscriptions.reduce((acc, sub) => {
    const existing = acc.find(item => item.name === sub.category);
    const monthlyPrice = sub.billing_cycle === 'yearly' ? sub.price / 12 : 
                       sub.billing_cycle === 'weekly' ? sub.price * 4.33 : sub.price;
    
    if (existing) {
      existing.value += monthlyPrice;
      existing.count += 1;
    } else {
      acc.push({
        name: sub.category,
        value: monthlyPrice,
        count: 1
      });
    }
    return acc;
  }, [] as Array<{name: string, value: number, count: number}>);

  // Couleurs pour les graphiques
  const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', 
    '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'
  ];

  // Données pour l'analyse comparative des prix
  const priceComparisonData = [
    { service: "Netflix", yourPrice: 13.49, marketAvg: 11.99, category: "Streaming" },
    { service: "Spotify", yourPrice: 9.99, marketAvg: 9.99, category: "Musique" },
    { service: "Adobe CC", yourPrice: 59.99, marketAvg: 52.99, category: "Design" },
    { service: "Office 365", yourPrice: 7.00, marketAvg: 8.99, category: "Productivité" },
  ];

  // Données d'évolution annuelle projetée
  const yearlyProjectionData = [
    { month: "Jan", actual: 71.20, projected: 68.00, optimized: 55.00 },
    { month: "Fév", actual: 68.50, projected: 70.00, optimized: 56.00 },
    { month: "Mar", actual: null, projected: 72.00, optimized: 58.00 },
    { month: "Avr", actual: null, projected: 74.00, optimized: 59.00 },
    { month: "Mai", actual: null, projected: 76.00, optimized: 61.00 },
    { month: "Juin", actual: null, projected: 78.00, optimized: 62.00 },
  ];

  return (
    <div className="space-y-6">
      {/* Évolution des dépenses */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des dépenses</CardTitle>
          <CardDescription>Tendance de vos abonnements sur 6 mois</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'amount' ? `${value}€` : value,
                  name === 'amount' ? 'Montant' : 'Abonnements'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Répartition par catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par catégorie</CardTitle>
            <CardDescription>Distribution de vos dépenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}€`, 'Montant mensuel']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Comparaison des prix */}
        <Card>
          <CardHeader>
            <CardTitle>Comparaison des prix</CardTitle>
            <CardDescription>Vos tarifs vs marché</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={priceComparisonData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="service" type="category" width={80} />
                <Tooltip formatter={(value) => [`${value}€`, '']} />
                <Legend />
                <Bar dataKey="yourPrice" fill="#ff7300" name="Votre prix" />
                <Bar dataKey="marketAvg" fill="#8884d8" name="Prix marché" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Projection et optimisation */}
      <Card>
        <CardHeader>
          <CardTitle>Projection annuelle</CardTitle>
          <CardDescription>Évolution actuelle vs optimisée</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearlyProjectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}€`, '']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#8884d8" 
                strokeWidth={3}
                name="Réel"
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="projected" 
                stroke="#82ca9d" 
                strokeDasharray="5 5"
                name="Projection actuelle"
              />
              <Line 
                type="monotone" 
                dataKey="optimized" 
                stroke="#ff7300" 
                strokeDasharray="10 5"
                name="Projection optimisée"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-green-800">Économie potentielle annuelle</span>
              <span className="text-xl font-bold text-green-600">~180€</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              En suivant nos recommandations d'optimisation
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};