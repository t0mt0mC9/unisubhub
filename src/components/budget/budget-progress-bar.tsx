import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

interface BudgetData {
  monthlyTotal: number;
  budgetLimit: number;
  percentage: number;
  isOverBudget: boolean;
  excess: number;
}

export const BudgetProgressBar = () => {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings: userSettings } = useUserSettings();
  const { settings: notificationSettings } = useNotifications();

  const calculateBudgetData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer tous les abonnements actifs
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('price, billing_cycle')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) {
        console.error('Erreur récupération abonnements:', error);
        return;
      }

      // Calculer le coût mensuel total
      let monthlyTotal = 0;
      for (const sub of subscriptions || []) {
        let monthlyPrice = sub.price;
        if (sub.billing_cycle === 'yearly') {
          monthlyPrice = sub.price / 12;
        } else if (sub.billing_cycle === 'weekly') {
          monthlyPrice = sub.price * 4;
        }
        monthlyTotal += monthlyPrice;
      }

      // Récupérer la limite de budget depuis la base (source de vérité)
      let budgetLimit = 100;
      const { data: notifSettings, error: notifErr } = await supabase
        .from('notification_settings')
        .select('budget_limit')
        .eq('user_id', user.id)
        .maybeSingle();
      if (notifErr) {
        console.warn('⚠️ Erreur lecture notification_settings, fallback userSettings/localStorage:', notifErr.message);
      }
      if (notifSettings?.budget_limit && typeof notifSettings.budget_limit === 'number') {
        budgetLimit = notifSettings.budget_limit;
      } else if (notificationSettings.budgetLimit) {
        budgetLimit = notificationSettings.budgetLimit;
      } else if (userSettings.budgetLimit) {
        budgetLimit = parseFloat(userSettings.budgetLimit) || 100;
      }

      console.log('🔄 Recalcul budget - Total:', monthlyTotal.toFixed(2), 'Limite (DB->hooks->localStorage):', budgetLimit);
      console.log('📊 Sources budget - DB:', notifSettings?.budget_limit, 'NotificationSettings:', notificationSettings.budgetLimit, 'UserSettings:', userSettings.budgetLimit);
      
      const percentage = (monthlyTotal / budgetLimit) * 100;
      const displayPercentage = Math.min(percentage, 100); // Limiter l'affichage à 100% pour la barre
      const isOverBudget = monthlyTotal > budgetLimit;
      const excess = isOverBudget ? monthlyTotal - budgetLimit : 0;

      setBudgetData({
        monthlyTotal,
        budgetLimit,
        percentage: displayPercentage,
        isOverBudget,
        excess
      });

    } catch (error) {
      console.error('Erreur calcul budget:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateBudgetData();
  }, [notificationSettings.budgetLimit, userSettings.budgetLimit]);

  // Recalculer aussi quand les paramètres changent (avec un petit délai pour la synchronisation)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateBudgetData();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [notificationSettings, userSettings]);

  // Calculer immédiatement si les données changent
  useEffect(() => {
    if (notificationSettings.budgetLimit !== undefined || userSettings.budgetLimit) {
      calculateBudgetData();
    }
  }, [notificationSettings.budgetLimit, userSettings.budgetLimit]);

  // Écouter les événements de mise à jour du budget
  useEffect(() => {
    const handleBudgetUpdate = (event: any) => {
      console.log('📢 Événement budgetUpdated reçu, nouveau budget:', event.detail?.newBudget);
      // Forcer le recalcul après un petit délai pour s'assurer que les hooks sont synchronisés
      setTimeout(() => {
        calculateBudgetData();
      }, 100);
    };

    window.addEventListener('budgetUpdated', handleBudgetUpdate);
    
    return () => {
      window.removeEventListener('budgetUpdated', handleBudgetUpdate);
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-6 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!budgetData) {
    return null;
  }

  const { monthlyTotal, budgetLimit, percentage, isOverBudget, excess } = budgetData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Suivi Budget Mensuel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dépenses actuelles</span>
            <span className={cn(
              "font-medium",
              isOverBudget ? "text-destructive" : "text-muted-foreground"
            )}>
              {monthlyTotal.toFixed(2)}€ / {budgetLimit}€
            </span>
          </div>
          
          <Progress 
            value={percentage} 
            className={cn(
              "h-3 transition-all duration-500",
              "[&>div]:transition-all [&>div]:duration-500"
            )}
            style={{
              '--progress-background': isOverBudget ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'
            } as any}
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0€</span>
            <span>{budgetLimit}€</span>
          </div>
        </div>

        {/* Indicateur de statut */}
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg text-sm transition-all duration-300",
          isOverBudget 
            ? "bg-destructive/10 text-destructive border border-destructive/20" 
            : "bg-primary/10 text-primary border border-primary/20"
        )}>
          {isOverBudget ? (
            <>
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">
                Budget dépassé de {excess.toFixed(2)}€ ({((monthlyTotal / budgetLimit - 1) * 100).toFixed(1)}%)
              </span>
            </>
          ) : (
            <>
              <TrendingDown className="h-4 w-4" />
              <span className="font-medium">
                Budget respecté • {(budgetLimit - monthlyTotal).toFixed(2)}€ restants
              </span>
            </>
          )}
        </div>

        {/* Détails */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1 transition-all duration-300">
            <p className="text-2xl font-bold text-primary">
              {monthlyTotal.toFixed(2)}€
            </p>
            <p className="text-xs text-muted-foreground">Dépenses mensuelles</p>
          </div>
          <div className="space-y-1 transition-all duration-300">
            <p className="text-2xl font-bold text-muted-foreground">
              {budgetLimit}€
            </p>
            <p className="text-xs text-muted-foreground">Budget limite</p>
          </div>
        </div>

        {isOverBudget && (
          <div className="text-xs text-center text-muted-foreground">
            💡 Consultez vos abonnements pour optimiser vos dépenses
          </div>
        )}
      </CardContent>
    </Card>
  );
};