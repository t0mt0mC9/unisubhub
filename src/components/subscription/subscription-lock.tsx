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

  const handleForceReauth = async () => {
    try {
      toast({
        title: "Nettoyage de la session...",
        description: "Réinitialisation complète de l'authentification en cours",
      });
      
      console.log('🔄 Début du nettoyage d\'authentification...');
      
      // 1. Nettoyer complètement l'état d'authentification
      cleanupAuthState();
      
      // 2. Tenter une déconnexion globale (ignore les erreurs)
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('✅ Déconnexion globale réussie');
      } catch (err) {
        console.log('⚠️ Erreur lors de la déconnexion globale (ignorée):', err);
      }
      
      // 3. Forcer un rafraîchissement complet de la page
      console.log('🔄 Redirection vers la page de connexion...');
      window.location.href = '/auth';
      
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      toast({
        title: "Erreur",
        description: "Impossible de nettoyer la session. Veuillez rafraîchir manuellement la page.",
        variant: "destructive",
      });
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
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Vérifier mon abonnement
              </Button>
              
              <Button 
                onClick={handleForceReauth} 
                variant="destructive"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Nettoyer et reconnecter
              </Button>
            </div>
            
            <Button 
              onClick={() => navigate('/')} 
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retourner à l'application
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