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
import { BankCallback } from "./pages/BankCallback";
import ExpenseAnalysis from "./pages/ExpenseAnalysis";
import { useSubscription } from "@/hooks/use-subscription";
import { useOnboarding } from "@/hooks/use-onboarding";
import { SubscriptionLock } from "@/components/subscription/subscription-lock";
import { OnboardingOverlay } from "@/components/onboarding/onboarding-overlay";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const { hasAccess, isLocked, loading: subscriptionLoading } = useSubscription();
  const { showOnboarding, loading: onboardingLoading, completeOnboarding } = useOnboarding();

  useEffect(() => {
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
      console.log('🔒 Pas d\'utilisateur connecté');
      return false;
    }
    
    console.log('👤 Utilisateur connecté:', {
      email: user.email,
      created_at: user.created_at,
      hasAccess: hasAccess,
      subscriptionData: subscriptionLoading ? 'loading...' : 'loaded'
    });
    
    // Si l'utilisateur a un abonnement actif selon le hook
    if (hasAccess) {
      console.log('✅ Accès accordé via abonnement actif');
      return true;
    }
    
    // Sinon, vérifier l'essai gratuit basé sur la date de création
    const userCreatedAt = new Date(user.created_at);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('📅 Vérification essai gratuit:', {
      userCreatedAt: userCreatedAt.toISOString(),
      now: now.toISOString(),
      daysSinceCreation,
      hasTrialAccess: daysSinceCreation < 14
    });
    
    // Donner accès pendant 14 jours après création
    const trialAccess = daysSinceCreation < 14;
    if (trialAccess) {
      console.log('✅ Accès accordé via essai gratuit');
    } else {
      console.log('❌ Essai gratuit expiré');
    }
    
    return trialAccess;
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (loading || subscriptionLoading || onboardingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Afficher l'onboarding pour les nouveaux utilisateurs connectés
  if (user && showOnboarding) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OnboardingOverlay onComplete={completeOnboarding} />
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
              path="/bank-callback" 
              element={<BankCallback />} 
            />
            <Route 
              path="/expense-analysis" 
              element={user ? (userHasAccess() ? <ExpenseAnalysis /> : <SubscriptionLock />) : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/analytics" 
              element={user ? (userHasAccess() ? <ExpenseAnalysis /> : <SubscriptionLock />) : <Navigate to="/auth" replace />} 
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
