import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Crown, Clock, Gift, RefreshCw, LogOut, ArrowLeft } from "lucide-react";
import { UnifiedSubscriptionManager } from "./unified-subscription-manager";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cleanupAuthState } from "@/lib/auth-cleanup";

interface SubscriptionLockProps {
  onUpgrade?: () => void;
  trialDaysRemaining?: number;
}

export const SubscriptionLock = ({ onUpgrade, trialDaysRemaining = 0 }: SubscriptionLockProps) => {
  const { refresh, loading } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRefresh = async () => {
    const data = await refresh();
    if (data?.subscribed && onUpgrade) {
      onUpgrade();
    }
  };

  const handleBackToAuth = async () => {
    try {
      console.log('🔄 Déconnexion et redirection vers /auth...');
      
      // Déconnexion de l'utilisateur
      await supabase.auth.signOut();
      
      // Nettoyer l'état d'authentification
      cleanupAuthState();
      
      // Rediriger vers la page de connexion
      navigate('/auth');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      // Rediriger quand même vers /auth
      navigate('/auth');
    }
  };
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Lock Icon */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-10 w-10 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Essai gratuit terminé
          </h1>
          <p className="text-muted-foreground mb-4">
            Votre période d'essai de 14 jours est maintenant terminée. 
            Passez à Premium pour continuer à utiliser UniSubHub.
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleBackToAuth} 
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retourner à la connexion
            </Button>
          </div>
        </div>

        {/* Premium Benefits */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Fonctionnalités Premium
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm">Suivi illimité d'abonnements</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Gift className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm">Offres exclusives et bons plans</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Crown className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm">Analyses détaillées des dépenses</span>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Choisissez votre plan</CardTitle>
          </CardHeader>
          <CardContent>
            <UnifiedSubscriptionManager 
              onSubscriptionChange={(isActive) => {
                if (isActive && onUpgrade) {
                  onUpgrade();
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            En vous abonnant, vous acceptez nos conditions d'utilisation 
            et notre politique de confidentialité.
          </p>
        </div>
      </div>
    </div>
  );
};