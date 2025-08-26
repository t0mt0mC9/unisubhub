
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Check, AlertCircle, Clock, Star } from "lucide-react";

interface SubscriptionStatusProps {
  subscribed: boolean;
  subscriptionTier?: string | null;
  subscriptionType?: string | null;
  subscriptionEnd?: string | null;
  trialActive?: boolean;
  trialDaysRemaining?: number;
  trialEndDate?: string | null;
  onUpgrade?: () => void;
}

export const SubscriptionStatus = ({ 
  subscribed, 
  subscriptionTier, 
  subscriptionType, 
  subscriptionEnd,
  trialActive,
  trialDaysRemaining,
  trialEndDate,
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

  const isTrialExpiringSoon = trialDaysRemaining !== undefined && trialDaysRemaining <= 3;

  // Utilisateur en période d'essai
  if (trialActive && subscriptionType === 'trial') {
    return (
      <Card className={`${isTrialExpiringSoon ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isTrialExpiringSoon ? 'text-orange-800' : 'text-blue-800'}`}>
            <Star className="h-5 w-5" />
            Essai Gratuit Actif
          </CardTitle>
          <CardDescription className={isTrialExpiringSoon ? 'text-orange-700' : 'text-blue-700'}>
            Profitez de toutes les fonctionnalités premium pendant votre période d'essai
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={isTrialExpiringSoon ? 'text-orange-700' : 'text-blue-700'}>Jours restants :</span>
              <Badge className={`${isTrialExpiringSoon ? 'bg-orange-600' : 'bg-blue-600'} text-white`}>
                {trialDaysRemaining} jour{trialDaysRemaining !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            {trialEndDate && (
              <div className="flex items-center justify-between">
                <span className={isTrialExpiringSoon ? 'text-orange-700' : 'text-blue-700'}>
                  Fin de l'essai :
                </span>
                <span className={`font-medium ${isTrialExpiringSoon ? 'text-orange-800' : 'text-blue-800'}`}>
                  {formatDate(trialEndDate)}
                </span>
              </div>
            )}

            {isTrialExpiringSoon && (
              <div className="text-sm text-orange-700 font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Votre essai se termine bientôt !
                </div>
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

            {onUpgrade && (
              <Button 
                onClick={onUpgrade}
                className={`w-full ${isTrialExpiringSoon ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              >
                <Crown className="mr-2 h-4 w-4" />
                {isTrialExpiringSoon ? 'Passer à Premium maintenant' : 'Passer à Premium'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Utilisateur sans abonnement et période d'essai expirée
  if (!subscribed) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            Période d'essai expirée
          </CardTitle>
          <CardDescription className="text-red-700">
            Choisissez un plan Premium pour continuer à utiliser toutes les fonctionnalités
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-red-700">
              • Accès limité aux fonctionnalités
              • Analyses restreintes
              • Support communautaire uniquement
            </div>
            {onUpgrade && (
              <Button 
                onClick={onUpgrade}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <Crown className="mr-2 h-4 w-4" />
                Choisir un plan Premium
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Utilisateur avec abonnement payant actif
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
                {isExpiringSoon() ? 'Expire le :' : 'Prochaine facturation :'}
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
