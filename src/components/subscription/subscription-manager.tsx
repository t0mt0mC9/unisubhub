import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoreKitSubscriptionPlans } from "./storekit-subscription-plans";
import { useStoreKitSubscription } from "@/hooks/use-storekit-subscription";
import { useToast } from "@/hooks/use-toast";
import { Shield, Smartphone, CreditCard, Check } from "lucide-react";

interface SubscriptionManagerProps {
  userId?: string;
  onSubscriptionChange?: (isActive: boolean) => void;
}

export const SubscriptionManager = ({ userId, onSubscriptionChange }: SubscriptionManagerProps) => {
  const { subscriptionInfo, loading, identifyUser, loadSubscriptionInfo } = useStoreKitSubscription();
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      identifyUser(userId);
    }
  }, [userId, identifyUser]);

  useEffect(() => {
    if (subscriptionInfo && onSubscriptionChange) {
      onSubscriptionChange(subscriptionInfo.isActive);
    }
  }, [subscriptionInfo, onSubscriptionChange]);

  const handleRefresh = async () => {
    try {
      await loadSubscriptionInfo();
      toast({
        title: "Statut mis à jour",
        description: "Le statut de votre abonnement a été actualisé",
      });
    } catch (error) {
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement de votre abonnement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informations importantes sur StoreKit */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
            <Smartphone className="h-5 w-5" />
            Paiements Apple StoreKit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Paiements sécurisés via Apple</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4 text-green-600" />
            <span>Géré par votre compte App Store</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-600" />
            <span>Synchronisé entre tous vos appareils Apple</span>
          </div>
        </CardContent>
      </Card>

      {/* Statut de l'abonnement */}
      {subscriptionInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Statut de l'abonnement
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Actualiser
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">Statut :</span>
                <Badge variant={subscriptionInfo.isActive ? "default" : "secondary"}>
                  {subscriptionInfo.isActive ? "Actif" : "Inactif"}
                </Badge>
              </div>
              
              {subscriptionInfo.tier && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Plan :</span>
                  <Badge variant="outline">{subscriptionInfo.tier}</Badge>
                </div>
              )}
              
              {subscriptionInfo.expirationDate && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Expiration :</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(subscriptionInfo.expirationDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans d'abonnement */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Plans d'abonnement</h2>
        <StoreKitSubscriptionPlans />
      </div>

      {/* Instructions pour les utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Important à savoir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• Les abonnements sont gérés par Apple via l'App Store</p>
          <p>• Vous pouvez annuler ou modifier votre abonnement dans les Réglages de votre iPhone</p>
          <p>• Les achats sont automatiquement synchronisés entre vos appareils Apple</p>
          <p>• Utilisez "Restaurer mes achats" si votre abonnement n'apparaît pas</p>
        </CardContent>
      </Card>
    </div>
  );
};