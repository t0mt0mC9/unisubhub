import { useState } from "react";
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
  Zap,
  ArrowRightLeft
} from "lucide-react";
import { useDynamicRecommendations } from "@/hooks/use-dynamic-recommendations";

interface AnalyticsStatsProps {
  subscriptions: any[];
}

export const AnalyticsStats = ({ subscriptions }: AnalyticsStatsProps) => {
  const { toast } = useToast();
  const [expandedRecommendation, setExpandedRecommendation] = useState<number | null>(null);
  
  // Utiliser les recommandations dynamiques
  const { recommendations: dynamicRecommendations, loading: recommendationsLoading } = useDynamicRecommendations(subscriptions);
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

  // Utiliser les recommandations dynamiques ou fallback statique
  const recommendations = dynamicRecommendations.length > 0 ? dynamicRecommendations : [
    {
      id: 1,
      type: "cost",
      title: "Économie potentielle identifiée",
      description: `Vous pourriez économiser ~${Math.round(totalMonthly * 0.15)}€/mois en optimisant vos abonnements`,
      impact: "Élevé",
      icon: "Euro",
      color: "text-green-600",
      bgColor: "bg-green-100",
      details: `Analysez vos abonnements les plus coûteux : ${expensiveSubscriptions.map(sub => sub.name).join(", ")}. Considérez des alternatives moins chères ou négociez des tarifs.`
    },
    {
      id: 2,
      type: "duplicate",
      title: "Services similaires détectés",
      description: "Vous avez plusieurs services de streaming, considérez regrouper",
      impact: "Moyen",
      icon: "Users",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      details: `Services de streaming détectés : ${subscriptions.filter(sub => sub.category === "Streaming").map(sub => sub.name).join(", ")}. Vous pourriez garder seulement 1-2 services principaux.`
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Élevé": return "bg-destructive text-destructive-foreground";
      case "Moyen": return "bg-warning text-warning-foreground";
      case "Faible": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRecommendationDetails = (recommendation: any) => {
    switch (recommendation.type) {
      case "cost":
        return `Analysez vos abonnements les plus coûteux : ${expensiveSubscriptions.map(sub => sub.name).join(", ")}. Considérez des alternatives moins chères ou négociez des tarifs.`;
      case "duplicate":
        const streamingServices = subscriptions.filter(sub => sub.category === "Streaming");
        return `Services de streaming détectés : ${streamingServices.map(sub => sub.name).join(", ")}. Vous pourriez garder seulement 1-2 services principaux.`;
      case "billing":
        return `Abonnements mensuels qui seraient moins chers en annuel : ${subscriptions.filter(sub => sub.billing_cycle === 'monthly').slice(0, 3).map(sub => sub.name).join(", ")}.`;
      case "usage":
        return `Services coûteux à analyser : ${expensiveSubscriptions.slice(0, 3).map(sub => `${sub.name} (${sub.price}€)`).join(", ")}. Vérifiez votre usage réel.`;
      default:
        return "Consultez vos abonnements pour plus d'optimisations possibles.";
    }
  };

  const handleToggleDetails = (recId: number) => {
    setExpandedRecommendation(expandedRecommendation === recId ? null : recId);
  };

  // Calcul dynamique du score d'optimisation
  const calculateOptimizationScore = () => {
    if (subscriptions.length === 0) return { total: 0, diversity: 0, price: 0, usage: 0 };

    // Score de diversité (0-100) : Mieux on répartit entre les catégories, mieux c'est
    const categories = Object.keys(categoryStats);
    const diversityScore = Math.min(100, categories.length * 25); // Max 4 catégories = 100pts
    
    // Score de prix (0-100) : Pénalise les abonnements chers
    const expensiveCount = expensiveSubscriptions.length;
    const expensiveRatio = expensiveCount / subscriptions.length;
    const priceScore = Math.max(0, 100 - (expensiveRatio * 60)); // -60pts si 100% d'abonnements chers
    
    // Score d'utilisation (0-100) : Détecte les doublons potentiels
    const duplicateCategories = Object.values(categoryStats).filter((count: number) => count > 2).length;
    const usageScore = Math.max(0, 100 - (duplicateCategories * 30)); // -30pts par catégorie avec >2 services
    
    // Score total (moyenne pondérée)
    const total = Math.round((diversityScore * 0.3 + priceScore * 0.4 + usageScore * 0.3));
    
    return { total, diversity: diversityScore, price: priceScore, usage: usageScore };
  };

  const optimizationScore = calculateOptimizationScore();

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Bon";
    if (score >= 40) return "Moyen";
    return "À améliorer";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Euro': return Euro;
      case 'Users': return Users;
      case 'Calendar': return Calendar;
      case 'Target': return Target;
      case 'ArrowRightLeft': return ArrowRightLeft;
      default: return Lightbulb;
    }
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
              <TrendingUp className="h-4 w-4 mr-1 text-success" />
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
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Recommandations d'optimisation
            {recommendationsLoading && (
              <div className="ml-2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            )}
          </CardTitle>
          <CardDescription>
            {recommendationsLoading 
              ? "Analyse des prix du marché en cours..." 
              : "Suggestions personnalisées basées sur les prix du marché"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec) => {
            const Icon = getIconComponent(rec.icon);
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
                        className={`text-xs ${getImpactColor(rec.impact)} border-none`}
                      >
                        {rec.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-7"
                      onClick={() => handleToggleDetails(rec.id)}
                    >
                      {expandedRecommendation === rec.id ? 'Masquer détails' : 'Voir détails'}
                    </Button>
                    
                     {expandedRecommendation === rec.id && (
                       <div className="mt-3 p-3 bg-muted/50 rounded-md border-l-4 border-primary">
                         <p className="text-sm text-foreground">
                           {rec.details || getRecommendationDetails(rec)}
                         </p>
                          {rec.potential_savings && (
                            <div className="mt-2 text-xs text-success font-medium">
                              💰 Économie estimée : {rec.potential_savings}/mois
                            </div>
                          )}
                       </div>
                     )}
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
            <CheckCircle className="h-5 w-5 text-success" />
            Score d'optimisation
          </CardTitle>
          <CardDescription>
            Score calculé sur la diversité (30%), le prix (40%) et l'utilisation (30%) de vos abonnements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`text-4xl font-bold ${getScoreColor(optimizationScore.total)}`}>
              {optimizationScore.total}/100
            </div>
            <Progress value={optimizationScore.total} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className={`font-medium ${getScoreColor(optimizationScore.diversity)}`}>
                  {getScoreLabel(optimizationScore.diversity)}
                </div>
                <div className="text-muted-foreground">Diversité</div>
              </div>
              <div className="text-center">
                <div className={`font-medium ${getScoreColor(optimizationScore.price)}`}>
                  {getScoreLabel(optimizationScore.price)}
                </div>
                <div className="text-muted-foreground">Prix</div>
              </div>
              <div className="text-center">
                <div className={`font-medium ${getScoreColor(optimizationScore.usage)}`}>
                  {getScoreLabel(optimizationScore.usage)}
                </div>
                <div className="text-muted-foreground">Utilisation</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};