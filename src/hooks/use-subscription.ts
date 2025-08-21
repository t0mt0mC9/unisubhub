import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_type: string | null;
  subscription_end: string | null;
  trial_active: boolean;
  trial_days_remaining: number;
  trial_end_date: string | null;
}

export const useSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_type: null,
    subscription_end: null,
    trial_active: false,
    trial_days_remaining: 0,
    trial_end_date: null
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkSubscription = async () => {
    try {
      setLoading(true);
      console.log('🔍 Vérification de l\'abonnement...');
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('❌ Erreur lors de l\'appel de check-subscription:', error);
        throw error;
      }
      
      console.log('✅ Données d\'abonnement reçues:', data);
      setSubscriptionData(data);
      return data;
    } catch (error: any) {
      console.error('Erreur lors de la vérification de l\'abonnement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier votre abonnement",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  // Determine if user has access (either subscribed or trial active)
  const hasAccess = subscriptionData.subscribed || subscriptionData.trial_active;
  
  // Check if trial has expired and user hasn't subscribed
  const isLocked = !subscriptionData.subscribed && !subscriptionData.trial_active;
  
  console.log('📊 État de l\'abonnement:', {
    subscribed: subscriptionData.subscribed,
    trial_active: subscriptionData.trial_active,
    subscription_tier: subscriptionData.subscription_tier,
    subscription_type: subscriptionData.subscription_type,
    hasAccess,
    isLocked
  });

  return {
    subscriptionData,
    loading,
    hasAccess,
    isLocked,
    checkSubscription,
    refresh: checkSubscription
  };
};