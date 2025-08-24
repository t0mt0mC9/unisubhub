import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Lightbulb,
  Euro,
  Calendar,
  Users,
  Zap
} from "lucide-react";

interface AnalyticsStatsProps {
  subscriptions: any[];
}

export const AnalyticsStats = ({ subscriptions }: AnalyticsStatsProps) => {
  const { toast } = useToast();
  // Calculs des statistiques basés sur les vraies données utilisateur
  const totalMonthly = subscriptions.reduce((sum, sub) => {
    const monthlyPrice = sub.billing_cycle === 'yearly' ? sub.price / 12 : 
                        sub.billing_cycle === 'weekly' ? sub.price * 4.33 : sub.price;
    return sum + monthlyPrice;
  }, 0);

  const totalYearly = totalMonthly * 12;
  
  const categoryStats = subscriptions.reduce((acc, sub) => {
    acc[sub.category] = (acc[sub.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryStats).sort(([,a], [,b]) => (b as number) - (a as number))[0];
  
  // Analyse des abonnements à risque (prix élevés)
  const expensiveSubscriptions = subscriptions.filter(sub => {
    const monthlyPrice = sub.billing_cycle === 'yearly' ? sub.price / 12 : 
                        sub.billing_cycle === 'weekly' ? sub.price * 4.33 : sub.price;
    return monthlyPrice > 20;
  });

  // Recommandations d'optimisation
  const recommendations = [
    {
      id: 1,
      type: "cost",
      title: "Économie potentielle identifiée",
      description: `Vous pourriez économiser ~${Math.round(totalMonthly * 0.15)}€/mois en optimisant vos abonnements`,
      impact: "Élevé",
      icon: Euro,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      id: 2,
      type: "duplicate",
      title: "Services similaires détectés",
      description: "Vous avez plusieurs services de streaming, considérez regrouper",
      impact: "Moyen",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      id: 3,
      type: "billing",
      title: "Optimisation facturation",
      description: "3 abonnements seraient moins chers en forfait annuel",
      impact: "Moyen",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      id: 4,
      type: "usage",
      title: "Abonnements sous-utilisés",
      description: "Analysez l'usage de vos services les plus coûteux",
      impact: "Élevé",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Élevé": return "bg-red-500";
      case "Moyen": return "bg-orange-500";
      case "Faible": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const handleRecommendationDetails = (recommendation: any) => {
    let detailMessage = "";
    
    switch (recommendation.type) {
      case "cost":
        detailMessage = `Analysez vos abonnements les plus coûteux : ${expensiveSubscriptions.map(sub => sub.name).join(", ")}. Considérez des alternatives moins chères ou négociez des tarifs.`;
        break;
      case "duplicate":
        const streamingServices = subscriptions.filter(sub => sub.category === "Streaming");
        detailMessage = `Services de streaming détectés : ${streamingServices.map(sub => sub.name).join(", ")}. Vous pourriez garder seulement 1-2 services principaux.`;
        break;
      case "billing":
        detailMessage = `Abonnements mensuels qui seraient moins chers en annuel : ${subscriptions.filter(sub => sub.billing_cycle === 'monthly').slice(0, 3).map(sub => sub.name).join(", ")}.`;
        break;
      case "usage":
        detailMessage = `Services coûteux à analyser : ${expensiveSubscriptions.slice(0, 3).map(sub => `${sub.name} (${sub.price}€)`).join(", ")}. Vérifiez votre usage réel.`;
        break;
      default:
        detailMessage = "Consultez vos abonnements pour plus d'optimisations possibles.";
    }

    toast({
      title: recommendation.title,
      description: detailMessage,
      duration: 5000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Dépenses mensuelles</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">
              {totalMonthly.toFixed(2)}€
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
              +5% vs mois dernier
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Budget annuel</CardDescription>
            <CardTitle className="text-2xl font-bold text-destructive">
              {totalYearly.toFixed(0)}€
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Target className="h-4 w-4 mr-1" />
              {subscriptions.length} services actifs
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Catégorie dominante */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Analyse par catégorie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topCategory && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{topCategory[0]}</span>
                <Badge variant="secondary">{topCategory[1] as number} services</Badge>
              </div>
              <Progress value={((topCategory[1] as number) / subscriptions.length) * 100} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">
                Votre catégorie principale représente {Math.round(((topCategory[1] as number) / subscriptions.length) * 100)}% de vos abonnements
              </p>
            </div>
          )}
          
          {expensiveSubscriptions.length > 0 && (
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800">Abonnements coûteux</span>
              </div>
              <p className="text-sm text-orange-700">
                {expensiveSubscriptions.length} abonnement(s) supérieur(s) à 20€/mois
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Recommandations d'optimisation
          </CardTitle>
          <CardDescription>
            Suggestions personnalisées pour réduire vos coûts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <div key={rec.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                <div className={`p-2 rounded-full ${rec.bgColor}`}>
                  <Icon className={`h-4 w-4 ${rec.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getImpactColor(rec.impact)} text-white border-none`}
                    >
                      {rec.impact}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-7"
                    onClick={() => handleRecommendationDetails(rec)}
                  >
                    Voir détails
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Score d'optimisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Score d'optimisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-green-600">78/100</div>
            <Progress value={78} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-green-600">Bon</div>
                <div className="text-muted-foreground">Diversité</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-orange-600">Moyen</div>
                <div className="text-muted-foreground">Prix</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">À améliorer</div>
                <div className="text-muted-foreground">Utilisation</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};