import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { revenueCatService } from "@/services/revenuecat";
import { Capacitor } from "@capacitor/core";
import { useCallback, useEffect, useState } from "react";

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
    trial_end_date: null,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fonction pour vérifier l'abonnement via RevenueCat (iOS/Android)
  const checkRevenueCatSubscription = async () => {
    try {
      console.log("🍎 Vérification de l'abonnement via RevenueCat...");

      const customerInfo = await revenueCatService.getCustomerInfo();
      console.log("📦 CustomerInfo RevenueCat:", customerInfo);

      // Vérifier les entitlements actifs
      const activeEntitlements = customerInfo.entitlements?.active || {};
      const hasActiveEntitlement = Object.keys(activeEntitlements).length > 0;

      // Vérifier aussi les abonnements actifs même sans entitlement
      const activeSubscriptions = customerInfo.activeSubscriptions || [];
      const hasActiveSubscription = activeSubscriptions.length > 0;

      console.log("🔐 Entitlements actifs:", activeEntitlements);
      console.log("📱 Abonnements actifs:", activeSubscriptions);
      console.log("✅ A un entitlement actif:", hasActiveEntitlement);
      console.log("✅ A un abonnement actif:", hasActiveSubscription);

      // Déterminer le tier et le type d'abonnement
      let tier: string | null = null;
      let subscriptionType: string | null = null;
      let expirationDate: string | null = null;
      let isSubscribed = false;

      if (hasActiveEntitlement) {
        // Prendre le premier entitlement actif
        const firstEntitlementKey = Object.keys(activeEntitlements)[0];
        const entitlement = activeEntitlements[firstEntitlementKey];

        // Déterminer le tier à partir du productIdentifier
        const productId = entitlement.productIdentifier || "";
        if (
          productId.includes("PM") ||
          productId.toLowerCase().includes("monthly")
        ) {
          tier = "Premium";
          subscriptionType = "monthly";
        } else if (
          productId.includes("PAV") ||
          productId.toLowerCase().includes("lifetime")
        ) {
          tier = "Lifetime";
          subscriptionType = "lifetime";
        } else if (
          productId.includes("PA") ||
          productId.toLowerCase().includes("annual")
        ) {
          tier = "Premium";
          subscriptionType = "annual";
        }

        expirationDate = entitlement.expirationDate || null;
        isSubscribed = true;
        console.log("📅 Date d'expiration:", expirationDate);
      } else if (hasActiveSubscription) {
        // Si pas d'entitlement mais un abonnement actif, essayer de déterminer le type
        const productId = activeSubscriptions[0] || "";
        if (
          productId.includes("PM") ||
          productId.toLowerCase().includes("monthly")
        ) {
          tier = "Premium";
          subscriptionType = "monthly";
          isSubscribed = true;
        } else if (
          productId.includes("PAV") ||
          productId.toLowerCase().includes("lifetime")
        ) {
          tier = "Lifetime";
          subscriptionType = "lifetime";
          isSubscribed = true;
        } else if (
          productId.includes("PA") ||
          productId.toLowerCase().includes("annual")
        ) {
          tier = "Premium";
          subscriptionType = "annual";
          isSubscribed = true;
        } else {
          // Abonnement actif mais type inconnu - donner l'accès quand même
          tier = "Premium";
          subscriptionType = "monthly";
          isSubscribed = true;
        }
        console.log("✅ Abonnement actif détecté sans entitlement:", productId);
      }

      // Vérifier si l'utilisateur est en trial
      const hasActiveTrial = activeSubscriptions.some((sub: string) =>
        sub.toLowerCase().includes("trial")
      );

      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      // Récupérer la date de début d'essai depuis le profil
      let daysSinceTrialStart = 0;
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("trial_start_date")
          .eq("id", userId)
          .single();

        const trialStartDate = profile?.trial_start_date
          ? new Date(profile.trial_start_date)
          : new Date(user.data.user?.created_at || new Date());
        
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - trialStartDate.getTime());
        daysSinceTrialStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      const subscriptionState: SubscriptionData = {
        subscribed: isSubscribed,
        subscription_tier: tier,
        subscription_type: subscriptionType,
        subscription_end: expirationDate,
        trial_active: hasActiveTrial || daysSinceTrialStart <= 14,
        trial_days_remaining: Math.max(0, 14 - daysSinceTrialStart),
        trial_end_date: null,
      };

      console.log("✅ État d'abonnement RevenueCat:", subscriptionState);
      setSubscriptionData(subscriptionState);
      return subscriptionState;
    } catch (error) {
      console.error("❌ Erreur lors de la vérification RevenueCat:", error);

      // En cas d'erreur, considérer que l'utilisateur n'a pas d'abonnement
      const emptyState: SubscriptionData = {
        subscribed: false,
        subscription_tier: null,
        subscription_type: null,
        subscription_end: null,
        trial_active: true,
        trial_days_remaining: 0,
        trial_end_date: null,
      };
      setSubscriptionData(emptyState);
      return emptyState;
    }
  };

  // Fonction pour vérifier l'abonnement via Supabase (Web)
  const checkSupabaseSubscription = async () => {
    try {
      console.log("🌐 Vérification de l'abonnement via Supabase...");

      // Vérifier d'abord si l'utilisateur est connecté
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log("❌ Utilisateur non connecté:", userError?.message);
        const emptyState: SubscriptionData = {
          subscribed: false,
          subscription_tier: null,
          subscription_type: null,
          subscription_end: null,
          trial_active: false,
          trial_days_remaining: 0,
          trial_end_date: null,
        };
        setSubscriptionData(emptyState);
        return emptyState;
      }

      console.log("✅ Utilisateur connecté:", user.id);
      console.log("📡 Appel de la fonction check-subscription...");

      const { data, error } = await supabase.functions.invoke(
        "check-subscription"
      );

      if (error) {
        console.error(
          "❌ Erreur lors de l'appel de check-subscription:",
          error
        );

        // Si c'est une erreur 401 (session expirée), déconnecter l'utilisateur
        if (
          error.status === 401 ||
          error.message?.includes("Session expired")
        ) {
          console.log("🔄 Session expirée, déconnexion...");
          await supabase.auth.signOut();
          return null;
        }

        throw error;
      }

      console.log("✅ Données d'abonnement reçues:", data);
      setSubscriptionData(data);
      return data;
    } catch (error: any) {
      console.error("❌ Erreur lors de la vérification Supabase:", error);

      // Si c'est une erreur de session, ne pas afficher le toast d'erreur
      if (
        !(error.status === 401 || error.message?.includes("Session expired"))
      ) {
        toast({
          title: "Erreur",
          description: "Impossible de vérifier votre abonnement",
          variant: "destructive",
        });
      }
      return null;
    }
  };

  // Fonction principale qui choisit la bonne méthode selon la plateforme
  const checkSubscription = async () => {
    try {
      setLoading(true);

      if (Capacitor.isNativePlatform()) {
        // Utiliser RevenueCat sur iOS/Android
        return await checkRevenueCatSubscription();
      } else {
        // Utiliser Supabase sur Web
        return await checkSupabaseSubscription();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    // Attendre un peu pour que la session soit stable
    const timer = setTimeout(async () => {
      if (isActive) {
        await checkSubscription();
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      isActive = false;
    };
  }, []); // Vide pour éviter les re-exécutions

  // RÈGLE D'ACTIVATION:
  // - hasAccess = true si abonnement actif OU période d'essai active (< 14 jours)
  // - isLocked = true si compte > 14 jours ET pas d'abonnement actif
  const hasAccess =
    subscriptionData.subscribed || subscriptionData.trial_active;

  const isLocked =
    !subscriptionData.subscribed && !subscriptionData.trial_active;

  // Log seulement au premier rendu et quand les valeurs changent vraiment
  useEffect(() => {
    console.log("📊 État de l'abonnement:", {
      subscribed: subscriptionData.subscribed,
      trial_active: subscriptionData.trial_active,
      subscription_tier: subscriptionData.subscription_tier,
      subscription_type: subscriptionData.subscription_type,
      hasAccess,
      isLocked,
    });
  }, [
    subscriptionData.subscribed,
    subscriptionData.trial_active,
    subscriptionData.subscription_tier,
    hasAccess,
    isLocked,
  ]);

  // Fonction refresh stable avec useCallback qui retourne les données
  const refresh = useCallback(async () => {
    console.log("🔄 Rafraîchissement manuel de l'abonnement...");
    const result = await checkSubscription();
    return result;
  }, []);

  return {
    ...subscriptionData,
    loading,
    hasAccess,
    isLocked,
    checkSubscription,
    refresh,
  };
};
