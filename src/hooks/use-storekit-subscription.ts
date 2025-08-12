import { useState, useEffect } from 'react';
import { revenueCatService, SubscriptionInfo } from '@/services/revenuecat';
import { useToast } from '@/hooks/use-toast';

export const useStoreKitSubscription = () => {
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const initializeService = async () => {
    if (initialized) return;
    
    try {
      await revenueCatService.initialize();
      setInitialized(true);
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      toast({
        title: "Erreur d'initialisation",
        description: "Impossible d'initialiser le service d'abonnement",
        variant: "destructive",
      });
    }
  };

  const loadSubscriptionInfo = async () => {
    if (!initialized) return;
    
    try {
      setLoading(true);
      const info = await revenueCatService.getSubscriptionInfo();
      setSubscriptionInfo(info);
    } catch (error) {
      console.error('Failed to load subscription info:', error);
    } finally {
      setLoading(false);
    }
  };

  const identifyUser = async (userId: string) => {
    if (!initialized) return;
    if (currentUserId === userId) return; // Éviter de réidentifier le même utilisateur
    
    try {
      await revenueCatService.identifyUser(userId);
      setCurrentUserId(userId);
      await loadSubscriptionInfo();
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  };

  const logout = async () => {
    if (!initialized) return;
    
    try {
      await revenueCatService.logout();
      setSubscriptionInfo(null);
      setCurrentUserId(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  useEffect(() => {
    initializeService();
  }, []);

  useEffect(() => {
    if (initialized) {
      loadSubscriptionInfo();
    }
  }, [initialized]);

  return {
    subscriptionInfo,
    loading,
    initialized,
    loadSubscriptionInfo,
    identifyUser,
    logout,
  };
};