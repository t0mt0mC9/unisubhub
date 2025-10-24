import { Toaster as Sonner } from "@/components/ui/sonner";
import { SplashScreen } from "@/components/ui/splash-screen";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { initializeOneSignal } from "./lib/onesignal";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import ResetPassword from "./pages/ResetPassword";

import { InitialSubscriptionSelector } from "@/components/subscription/initial-subscription-selector";
import { SubscriptionLock } from "@/components/subscription/subscription-lock";
import { useSubscription } from "@/hooks/use-subscription";
import { CustomerInfo, Purchases } from "@revenuecat/purchases-capacitor";
import DeepLinkHandler from "./deeplink/DeepLinkHandler";
import ExpenseAnalysis from "./pages/ExpenseAnalysis";
import { revenueCatService } from "./services/revenuecat";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const {
    hasAccess,
    loading: subscriptionLoading,
    refresh: refreshSubscription,
  } = useSubscription();
  const [showInitialSetup, setShowInitialSetup] = useState(false);
  const refreshedOnceRef = useRef(false);

  // Force refresh subscription status after login - ONLY ONCE
  useEffect(() => {
    if (!user?.id || refreshedOnceRef.current) return;
    refreshedOnceRef.current = true;

    const timer = setTimeout(() => {
      console.log("🔄 Rafraîchissement unique de l'abonnement...");
      refreshSubscription();
    }, 1200);

    return () => clearTimeout(timer);
  }, [user?.id, refreshSubscription]);

  useEffect(() => {
    // Initialize OneSignal safely after auth is ready
    setTimeout(() => {
      initializeOneSignal();
    }, 1000);

    // Initialize RevenueCat
    const initRevenueCat = async () => {
      try {
        await revenueCatService.initialize();
        console.log("✅ RevenueCat initialisé");
      } catch (error) {
        console.error(
          "❌ Erreur lors de l'initialisation de RevenueCat:",
          error
        );
      }
    };

    initRevenueCat();

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", { event, session });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", { session });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fonction pour déterminer si l'utilisateur a accès
  const userHasAccess = () => {
    if (!user) {
      console.log("🔍 userHasAccess: Pas d'utilisateur connecté");
      return false;
    }

    // Utiliser directement la valeur hasAccess du hook useSubscription
    // Le hook gère déjà la logique d'abonnement et de trial
    console.log("✅ userHasAccess: Accès =", hasAccess);
    return hasAccess;
  };

  useEffect(() => {
    console.log("🔔 Configuration du listener RevenueCat...");

    // Stocker la référence pour le cleanup
    let listenerAdded = false;

    const setupListener = async () => {
      try {
        await Purchases.addCustomerInfoUpdateListener(
          (customerInfo: CustomerInfo) => {
            console.log("CustomerInfo mis à jour !", customerInfo);
            refreshSubscription();
          }
        );
        listenerAdded = true;
        console.log("Listener RevenueCat configuré");
      } catch (error) {
        console.error(
          "Erreur lors de la configuration du listener RevenueCat:",
          error
        );
      }
    };

    setupListener();
  }, [refreshSubscription]);

  // Check if user needs initial setup
  useEffect(() => {
    if (user && !loading && !subscriptionLoading) {
      const setupCompleted = localStorage.getItem(
        `initial-setup-completed-${user.id}`
      );
      if (!setupCompleted) {
        setShowInitialSetup(true);
      }
    }
  }, [user, loading, subscriptionLoading]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Pendant le chargement de l'abonnement, ne pas afficher l'écran de verrouillage
  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Afficher la sélection d'abonnements pour les nouveaux utilisateurs connectés
  if (user && showInitialSetup) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <InitialSubscriptionSelector
            onComplete={() => setShowInitialSetup(false)}
          />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DeepLinkHandler />
          <Routes>
            <Route
              path="/"
              element={
                user ? (
                  userHasAccess() ? (
                    <Index />
                  ) : (
                    <SubscriptionLock />
                  )
                ) : (
                  <Landing />
                )
              }
            />
            <Route path="/landing" element={<Landing />} />
            <Route
              path="/auth"
              element={!user ? <Auth /> : <Navigate to="/" replace />}
            />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/expense-analysis"
              element={
                user ? (
                  userHasAccess() ? (
                    <ExpenseAnalysis />
                  ) : (
                    <SubscriptionLock />
                  )
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/analytics"
              element={
                user ? (
                  userHasAccess() ? (
                    <ExpenseAnalysis />
                  ) : (
                    <SubscriptionLock />
                  )
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
