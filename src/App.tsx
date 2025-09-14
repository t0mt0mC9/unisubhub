import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SplashScreen } from "@/components/ui/splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import { initializeOneSignal } from "./lib/onesignal";

import ExpenseAnalysis from "./pages/ExpenseAnalysis";
import { useSubscription } from "@/hooks/use-subscription";
import { SubscriptionLock } from "@/components/subscription/subscription-lock";
import { InitialSubscriptionSelector } from "@/components/subscription/initial-subscription-selector";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const { hasAccess, isLocked, loading: subscriptionLoading, refresh: refreshSubscription } = useSubscription();
  const [showInitialSetup, setShowInitialSetup] = useState(false);

  // Force refresh subscription status when user loads the app - ONLY ONCE
  useEffect(() => {
    let isActive = true;
    
    if (user && !subscriptionLoading && isActive) {
      const timer = setTimeout(() => {
        if (isActive) {
          console.log('🔄 Rafraîchissement unique de l\'abonnement...');
          refreshSubscription();
        }
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        isActive = false;
      };
    }
  }, [user?.id]); // Seulement quand l'ID utilisateur change

  useEffect(() => {
    // Initialize OneSignal safely after auth is ready
    setTimeout(() => {
      initializeOneSignal();
    }, 1000);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fonction pour déterminer si l'utilisateur a accès
  const userHasAccess = () => {
    if (!user) {
      console.log('🔍 userHasAccess: Pas d\'utilisateur connecté');
      return false;
    }
    
    // PRIORITÉ 1: Si l'utilisateur a un abonnement actif selon le hook
    if (hasAccess) {
      console.log('✅ userHasAccess: Accès accordé via abonnement/trial actif');
      return true;
    }
    
    // PRIORITÉ 2: Vérifier l'essai gratuit basé sur la date de création (fallback uniquement)
    const userCreatedAt = new Date(user.created_at);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Donner accès pendant 14 jours après création (seulement si pas d'abonnement)
    const trialAccess = daysSinceCreation < 14;
    
    console.log('🔍 userHasAccess: État détaillé', {
      hasAccess,
      daysSinceCreation,
      trialAccess,
      subscriptionLoading,
      finalAccess: trialAccess
    });
    
    return trialAccess;
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Check if user needs initial setup
  useEffect(() => {
    if (user && !loading && !subscriptionLoading) {
      const setupCompleted = localStorage.getItem(`initial-setup-completed-${user.id}`);
      if (!setupCompleted) {
        setShowInitialSetup(true);
      }
    }
  }, [user, loading, subscriptionLoading]);

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
          <InitialSubscriptionSelector onComplete={() => setShowInitialSetup(false)} />
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
          <Routes>
            <Route 
              path="/" 
              element={user ? (userHasAccess() ? <Index /> : <SubscriptionLock />) : <Landing />} 
            />
            <Route 
              path="/landing" 
              element={<Landing />} 
            />
            <Route 
              path="/auth" 
              element={!user ? <Auth /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/expense-analysis" 
              element={user ? (userHasAccess() ? <ExpenseAnalysis /> : <SubscriptionLock />) : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/analytics" 
              element={user ? (userHasAccess() ? <ExpenseAnalysis /> : <SubscriptionLock />) : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/payment-success" 
              element={<PaymentSuccess />} 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
