import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserSettings } from './use-user-settings';

export const useBudgetChecker = () => {
  const { settings } = useUserSettings();

  const checkBudget = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('🔍 Vérification automatique du budget...');
      
      const { data, error } = await supabase.functions.invoke('check-budget-realtime', {
        body: { userId: user.id }
      });

      if (error) {
        console.error('Erreur vérification budget:', error);
        return;
      }

      if (data?.budget_exceeded && data?.alert_sent) {
        console.log('⚠️ Budget dépassé - Alerte envoyée');
      } else if (data?.budget_exceeded && data?.alert_already_sent) {
        console.log('ℹ️ Budget dépassé - Alerte déjà envoyée aujourd\'hui');
      } else {
        console.log('✅ Budget respecté');
      }

      return data;
    } catch (error) {
      console.error('Erreur vérification budget:', error);
    }
  };

  // Vérifier le budget automatiquement quand les paramètres changent
  useEffect(() => {
    if (settings.budgetAlerts) {
      checkBudget();
    }
  }, [settings.budgetLimit, settings.budgetAlerts]);

  return { checkBudget };
};