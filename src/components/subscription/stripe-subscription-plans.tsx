import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToastAction } from "@/components/ui/toast";
import { Check, Crown, Star, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StripePlan {
  id: string;
  name: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
  interval: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
}

const plans: StripePlan[] = [
  {
    id: "monthly_plan",
    name: "Plan Mensuel",
    description: "Analyses détaillées illimitées + Recommandations d'optimisation + alertes personnalisées + support prioritaire",
    price: "4,99€",
    priceAmount: 499,
    currency: "eur",
    interval: "month",
    features: [
      "Analyses détaillées illimitées",
      "Recommandations d'optimisation",
      "Alertes personnalisées",
      "Support prioritaire"
    ],
    icon: <Star className="h-6 w-6" />,
  },
  {
    id: "lifetime_plan",
    name: "Plan à Vie",
    description: "Avantages du plan mensuel + Abonnements illimités + Fonctionnalités premium",
    price: "89,99€",
    priceAmount: 8999,
    currency: "eur",
    interval: "lifetime",
    features: [
      "Analyses détaillées illimitées",
      "Recommandations d'optimisation", 
      "Alertes personnalisées",
      "Support prioritaire",
      "Abonnements illimités",
      "Fonctionnalités premium",
      "Paiement unique"
    ],
    icon: <Crown className="h-6 w-6" />,
    popular: true,
  },
];

export const StripeSubscriptionPlans = () => {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePurchase = async (plan: StripePlan) => {
    setPurchasing(plan.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId: plan.id,
          priceAmount: plan.priceAmount,
          currency: plan.currency,
          interval: plan.interval,
          planName: plan.name,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Essayer d'ouvrir dans un nouvel onglet
        const newWindow = window.open(data.url, '_blank');
        
        // Si le popup est bloqué, proposer une alternative
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          toast({
            title: "Popup bloqué",
            description: "Votre navigateur bloque les popups. Cliquez ici pour continuer vers Stripe.",
            action: (
              <ToastAction 
                altText="Continuer vers Stripe"
                onClick={() => window.location.href = data.url}
              >
                Continuer vers Stripe
              </ToastAction>
            ),
          });
        }
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);
      toast({
        title: "Erreur d'achat",
        description: "Une erreur est survenue lors de la création de la session de paiement",
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                Le plus populaire
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                {plan.icon}
              </div>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription className="text-sm">{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.interval !== 'lifetime' && (
                  <span className="text-muted-foreground">/{plan.interval === 'month' ? 'mois' : 'an'}</span>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button
                onClick={() => handlePurchase(plan)}
                disabled={purchasing === plan.id}
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
              >
                {purchasing === plan.id && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {plan.interval === 'lifetime' ? 'Acheter maintenant' : "S'abonner"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Paiements sécurisés via Stripe • Annulation possible à tout moment</p>
      </div>
    </div>
  );
};