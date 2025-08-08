
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Crown, 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Infinity,
  CreditCard,
  Settings,
  Clock,
  AlertTriangle
} from "lucide-react";

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_type: string | null;
  subscription_end: string | null;
  trial_active: boolean;
  trial_days_remaining: number;
  trial_end_date: string | null;
}

export const SubscriptionPlans = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_type: null,
    subscription_end: null,
    trial_active: false,
    trial_days_remaining: 0,
    trial_end_date: null
  });
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const { toast } = useToast();

  // Check subscription status
  const checkSubscriptionStatus = async () => {
    try {
      setCheckingSubscription(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscriptionData(data);
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier votre abonnement",
        variant: "destructive",
      });
    } finally {
      setCheckingSubscription(false);
    }
  };

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const handleSubscribe = async (planType: 'monthly' | 'lifetime') => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        // Redirect to Stripe checkout in the same window
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la session de paiement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        // Redirect to Stripe customer portal in the same window
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'accéder au portail client",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatSubscriptionEnd = (endDate: string) => {
    return new Date(endDate).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (checkingSubscription) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Chargement...</h2>
          <p className="text-muted-foreground">Vérification de votre abonnement en cours</p>
        </div>
      </div>
    );
  }

  const isTrialExpiringSoon = subscriptionData.trial_days_remaining <= 3;

  return (
    <div className="space-y-6">
      {/* Trial Status */}
      {subscriptionData.trial_active && (
        <Card className={`${isTrialExpiringSoon ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isTrialExpiringSoon ? 'text-orange-800' : 'text-blue-800'}`}>
              <Star className="h-5 w-5" />
              Essai Gratuit Actif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={isTrialExpiringSoon ? 'text-orange-700' : 'text-blue-700'}>Jours restants :</span>
                <Badge className={`${isTrialExpiringSoon ? 'bg-orange-600' : 'bg-blue-600'} text-white`}>
                  {subscriptionData.trial_days_remaining} jour{subscriptionData.trial_days_remaining !== 1 ? 's' : ''}
                </Badge>
              </div>
              {subscriptionData.trial_end_date && (
                <div className="flex items-center justify-between">
                  <span className={isTrialExpiringSoon ? 'text-orange-700' : 'text-blue-700'}>Fin de l'essai :</span>
                  <span className={`font-medium ${isTrialExpiringSoon ? 'text-orange-800' : 'text-blue-800'}`}>
                    {formatSubscriptionEnd(subscriptionData.trial_end_date)}
                  </span>
                </div>
              )}
              {isTrialExpiringSoon && (
                <div className="flex items-center gap-2 text-orange-700 font-medium">
                  <Clock className="h-4 w-4" />
                  <span>Votre essai se termine bientôt !</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paid Subscription Status */}
      {subscriptionData.subscribed && subscriptionData.subscription_type !== 'trial' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Crown className="h-5 w-5" />
              Abonnement Actif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-green-700">Plan actuel :</span>
                <Badge className="bg-green-600 text-white">
                  {subscriptionData.subscription_tier} - {subscriptionData.subscription_type === 'monthly' ? 'Mensuel' : 'À vie'}
                </Badge>
              </div>
              {subscriptionData.subscription_end && subscriptionData.subscription_type === 'monthly' && (
                <div className="flex items-center justify-between">
                  <span className="text-green-700">Renouvellement :</span>
                  <span className="text-green-800 font-medium">
                    {formatSubscriptionEnd(subscriptionData.subscription_end)}
                  </span>
                </div>
              )}
              {subscriptionData.subscription_type === 'lifetime' && (
                <div className="flex items-center justify-between">
                  <span className="text-green-700">Statut :</span>
                  <span className="text-green-800 font-medium flex items-center gap-1">
                    <Infinity className="h-4 w-4" />
                    Accès à vie
                  </span>
                </div>
              )}
            </div>
            <Button 
              onClick={handleManageSubscription}
              disabled={isLoading}
              variant="outline"
              className="w-full mt-4 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            >
              <Settings className="mr-2 h-4 w-4" />
              Gérer mon abonnement
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Trial Expired */}
      {!subscriptionData.subscribed && !subscriptionData.trial_active && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Période d'essai expirée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 text-sm mb-4">
              Votre essai gratuit de 14 jours est terminé. Choisissez un plan pour continuer à utiliser toutes les fonctionnalités.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {subscriptionData.subscribed && subscriptionData.subscription_type !== 'trial' 
            ? "Changer de plan" 
            : subscriptionData.trial_active 
              ? "Passez à Premium" 
              : "Choisissez votre plan"
          }
        </h2>
        <p className="text-muted-foreground">
          {subscriptionData.trial_active 
            ? "Évitez l'interruption en choisissant un plan avant la fin de votre essai"
            : "Accédez à l'analyse avancée, aux recommandations personnalisées et bien plus"
          }
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Plan */}
        <Card className={`relative ${subscriptionData.subscription_type === 'monthly' ? 'border-primary ring-2 ring-primary/20' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Plan Mensuel
              </CardTitle>
              {subscriptionData.subscription_type === 'monthly' && (
                <Badge className="bg-primary text-primary-foreground">Actuel</Badge>
              )}
            </div>
            <CardDescription>
              Parfait pour essayer toutes les fonctionnalités
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">5€</div>
              <div className="text-sm text-muted-foreground">par mois</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Analyses détaillées illimitées</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Recommandations d'optimisation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Alertes personnalisées</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Support prioritaire</span>
              </div>
            </div>

            <Button 
              onClick={() => handleSubscribe('monthly')}
              disabled={isLoading || subscriptionData.subscription_type === 'monthly'}
              className="w-full"
              variant={subscriptionData.subscription_type === 'monthly' ? "outline" : "default"}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {subscriptionData.subscription_type === 'monthly' ? 'Plan actuel' : 'Choisir ce plan'}
            </Button>
          </CardContent>
        </Card>

        {/* Lifetime Plan */}
        <Card className={`relative ${subscriptionData.subscription_type === 'lifetime' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-purple-200'}`}>
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-purple-600 text-white px-3 py-1">
              <Star className="mr-1 h-3 w-3" />
              Meilleure offre
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-600" />
                Plan À Vie
              </CardTitle>
              {subscriptionData.subscription_type === 'lifetime' && (
                <Badge className="bg-purple-600 text-white">Actuel</Badge>
              )}
            </div>
            <CardDescription>
              Un seul paiement, accès à vie à toutes les fonctionnalités
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">99€</div>
              <div className="text-sm text-muted-foreground">paiement unique</div>
              <div className="text-xs text-purple-600 font-medium mt-1">
                Économisez 60€ par an !
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Tout du plan mensuel</span>
              </div>
              <div className="flex items-center gap-2">
                <Infinity className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Accès à vie garanti</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Toutes les futures fonctionnalités</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Support VIP exclusif</span>
              </div>
            </div>

            <Button 
              onClick={() => handleSubscribe('lifetime')}
              disabled={isLoading || subscriptionData.subscription_type === 'lifetime'}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              variant={subscriptionData.subscription_type === 'lifetime' ? "outline" : "default"}
            >
              <Crown className="mr-2 h-4 w-4" />
              {subscriptionData.subscription_type === 'lifetime' ? 'Plan actuel' : 'Accès à vie'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <Button 
          onClick={checkSubscriptionStatus}
          variant="outline"
          disabled={checkingSubscription}
        >
          {checkingSubscription ? "Vérification..." : "Actualiser le statut"}
        </Button>
      </div>
    </div>
  );
};
