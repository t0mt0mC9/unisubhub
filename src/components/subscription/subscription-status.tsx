import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Check, AlertCircle } from "lucide-react";

interface SubscriptionStatusProps {
  subscribed: boolean;
  subscriptionTier?: string | null;
  subscriptionType?: string | null;
  subscriptionEnd?: string | null;
  onUpgrade?: () => void;
}

export const SubscriptionStatus = ({ 
  subscribed, 
  subscriptionTier, 
  subscriptionType, 
  subscriptionEnd,
  onUpgrade 
}: SubscriptionStatusProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpiringSoon = () => {
    if (!subscriptionEnd || subscriptionType === 'lifetime') return false;
    const endDate = new Date(subscriptionEnd);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7;
  };

  if (!subscribed) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            Version Gratuite
          </CardTitle>
          <CardDescription className="text-orange-700">
            Débloquez toutes les fonctionnalités avec un abonnement Premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-orange-700">
              • Analyses limitées
              • Fonctionnalités de base uniquement
              • Support communautaire
            </div>
            {onUpgrade && (
              <Button 
                onClick={onUpgrade}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Crown className="mr-2 h-4 w-4" />
                Passer à Premium
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${isExpiringSoon() ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isExpiringSoon() ? 'text-yellow-800' : 'text-green-800'}`}>
          <Crown className="h-5 w-5" />
          Abonnement Premium Actif
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={isExpiringSoon() ? 'text-yellow-700' : 'text-green-700'}>Plan actuel :</span>
            <Badge className={`${isExpiringSoon() ? 'bg-yellow-600' : 'bg-green-600'} text-white`}>
              {subscriptionTier} - {subscriptionType === 'monthly' ? 'Mensuel' : 'À vie'}
            </Badge>
          </div>
          
          {subscriptionType === 'lifetime' ? (
            <div className="flex items-center gap-2 text-green-700">
              <Check className="h-4 w-4" />
              <span>Accès à vie - Aucune expiration</span>
            </div>
          ) : subscriptionEnd && (
            <div className="flex items-center justify-between">
              <span className={isExpiringSoon() ? 'text-yellow-700' : 'text-green-700'}>
                {isExpiringSoon() ? 'Expire le :' : 'Renouvellement :'}
              </span>
              <span className={`font-medium ${isExpiringSoon() ? 'text-yellow-800' : 'text-green-800'}`}>
                {formatDate(subscriptionEnd)}
              </span>
            </div>
          )}

          {isExpiringSoon() && (
            <div className="text-sm text-yellow-700 font-medium">
              ⚠️ Votre abonnement expire bientôt !
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Analyses illimitées</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Recommandations avancées</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Support prioritaire</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};