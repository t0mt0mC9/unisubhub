import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, AlertCircle, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { revenueCatService, SubscriptionInfo } from "@/services/revenuecat";

// Types locaux pour éviter les imports conditionnels
interface PurchasesOffering {
  identifier: string;
  serverDescription: string;
  metadata: Record<string, any>;
  availablePackages: PurchasesPackage[];
}

interface PurchasesPackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    description: string;
    title: string;
    priceString: string;
    price: number;
    currencyCode: string;
  };
  offeringIdentifier: string;
}

export const MobileSubscriptionPlans = () => {
  const [offerings, setOfferings] = useState<PurchasesOffering[]>([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeRevenueCat();
  }, []);

  const initializeRevenueCat = async () => {
    try {
      await revenueCatService.initialize();
      await loadOfferings();
      await loadSubscriptionInfo();
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      toast({
        title: "Erreur d'initialisation",
        description: "Impossible de charger les options d'abonnement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOfferings = async () => {
    try {
      const currentOffering = await revenueCatService.getCurrentOffering();
      if (currentOffering) {
        setOfferings([currentOffering]);
      }
    } catch (error) {
      console.error('Failed to load offerings:', error);
    }
  };

  const loadSubscriptionInfo = async () => {
    try {
      const info = await revenueCatService.getSubscriptionInfo();
      setSubscriptionInfo(info);
    } catch (error) {
      console.error('Failed to load subscription info:', error);
    }
  };

  const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
    setPurchasing(packageToPurchase.identifier);
    
    try {
      await revenueCatService.purchasePackage(packageToPurchase);
      await loadSubscriptionInfo();
      
      toast({
        title: "Abonnement activé !",
        description: "Votre abonnement a été activé avec succès",
      });
    } catch (error: any) {
      console.error('Purchase failed:', error);
      
      if (error.code === 'PURCHASE_CANCELLED') {
        toast({
          title: "Achat annulé",
          description: "L'achat a été annulé par l'utilisateur",
        });
      } else {
        // Log détaillé pour le débogage
        console.error('Détails de l\'erreur d\'achat:', {
          code: error.code,
          message: error.message,
          userInfo: error.userInfo,
          stack: error.stack
        });
        
        toast({
          title: "Erreur d'achat",
          description: `Erreur: ${error.message || 'Une erreur inconnue est survenue'}. Code: ${error.code || 'N/A'}`,
          variant: "destructive",
        });
      }
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    try {
      await revenueCatService.restorePurchases();
      await loadSubscriptionInfo();
      
      toast({
        title: "Achats restaurés",
        description: "Vos achats précédents ont été restaurés",
      });
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      toast({
        title: "Erreur de restauration",
        description: "Impossible de restaurer vos achats",
        variant: "destructive",
      });
    }
  };

  const getPlanIcon = (productId: string) => {
    if (productId.includes('monthly') || productId === 'PM00') return <Star className="h-6 w-6" />;
    if (productId.includes('lifetime') || productId === 'PAV00') return <Crown className="h-6 w-6" />;
    return <Star className="h-6 w-6" />;
  };

  const getPlanFeatures = (productId: string) => {
    if (productId.includes('monthly') || productId === 'PM00') {
      return [
        "Analyses détaillées illimitées",
        "Recommandations d'optimisation",
        "Alertes personnalisées",
        "Support prioritaire"
      ];
    }
    if (productId.includes('lifetime') || productId === 'PAV00') {
      return [
        "Analyses détaillées illimitées",
        "Recommandations d'optimisation", 
        "Alertes personnalisées",
        "Support prioritaire",
        "Abonnements illimités",
        "Fonctionnalités premium",
        "Paiement unique - à vie"
      ];
    }
    return ["Fonctionnalités de base"];
  };

  const isPopularPlan = (productId: string) => {
    return productId.includes('lifetime') || productId === 'PAV00';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des options d'abonnement...</p>
        </div>
      </div>
    );
  }

  if (offerings.length === 0) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucun abonnement disponible</h3>
        <p className="text-muted-foreground mb-4">
          Les options d'abonnement ne sont pas disponibles pour le moment.
        </p>
        <Button variant="outline" onClick={loadOfferings}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info sur les paiements mobiles */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Smartphone className="h-5 w-5" />
            Paiements mobiles
          </CardTitle>
          <CardDescription>
            Paiements sécurisés via Apple App Store ou Google Play Store
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statut de l'abonnement actuel */}
      {subscriptionInfo?.isActive && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-400">
              <Check className="h-5 w-5" />
              Abonnement actif
            </CardTitle>
            <CardDescription>
              Plan {subscriptionInfo.tier} - 
              {subscriptionInfo.expirationDate && 
                ` Expire le ${new Date(subscriptionInfo.expirationDate).toLocaleDateString('fr-FR')}`
              }
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Plans d'abonnement */}
      <div className="grid gap-6 md:grid-cols-2">
        {offerings.length > 0 && offerings[0].availablePackages ? 
          offerings[0].availablePackages.map((pkg) => {
            const isCurrentPlan = subscriptionInfo?.productId === pkg.product.identifier;
            const popular = isPopularPlan(pkg.product.identifier);
            
            return (
              <Card key={pkg.identifier} className={`relative ${isCurrentPlan ? 'ring-2 ring-primary' : popular ? 'ring-2 ring-primary' : ''}`}>
                {popular && !isCurrentPlan && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                    Le plus populaire
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    Plan actuel
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    {getPlanIcon(pkg.product.identifier)}
                  </div>
                  <CardTitle>{pkg.product.title}</CardTitle>
                  <CardDescription className="text-sm">{pkg.product.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">
                      {pkg.product.priceString}
                    </span>
                    {!pkg.product.identifier.includes('lifetime') && (
                      <span className="text-muted-foreground">
                        /{pkg.packageType === 'MONTHLY' ? 'mois' : 'an'}
                      </span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {getPlanFeatures(pkg.product.identifier).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handlePurchase(pkg)}
                    disabled={purchasing === pkg.identifier || isCurrentPlan}
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : popular ? "default" : "outline"}
                  >
                    {purchasing === pkg.identifier && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {isCurrentPlan ? "Plan actuel" : pkg.product.identifier.includes('lifetime') ? 'Acheter maintenant' : "S'abonner"}
                  </Button>
                </CardContent>
              </Card>
            );
          }) : (
            <div className="col-span-2 text-center p-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun plan disponible</h3>
              <p className="text-muted-foreground">
                Les plans d'abonnement ne sont pas disponibles actuellement.
              </p>
            </div>
          )
        }
      </div>

      {/* Bouton de restauration */}
      <div className="text-center">
        <Button variant="outline" onClick={handleRestore}>
          Restaurer mes achats
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Si vous avez déjà acheté un abonnement, cliquez ici pour le restaurer.
        </p>
      </div>
    </div>
  );
};