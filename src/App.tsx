import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SplashScreen } from "@/components/ui/splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import { BankCallback } from "./pages/BankCallback";
import ExpenseAnalysis from "./pages/ExpenseAnalysis";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    const isNative = Capacitor.isNativePlatform();
    
    console.log('🔄 Initializing auth - Platform:', isNative ? 'Native' : 'Web');

    const initializeAuth = async () => {
      try {
        // Pour mobile, ajouter un délai pour assurer la persistence
        if (isNative) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
        }

        if (mounted) {
          console.log('✅ Session loaded:', session?.user?.email || 'No user');
          setSession(session);
          setUser(session?.user ?? null);
          setAuthInitialized(true);
          
          // Délai supplémentaire sur mobile avant de masquer le loading
          if (isNative) {
            setTimeout(() => {
              if (mounted) setLoading(false);
            }, 300);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setAuthInitialized(true);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Setup auth listener avec logique spécifique mobile
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth event:', event, session?.user?.email || 'No user');
        
        if (mounted && authInitialized) {
          // Sur mobile, ajouter un délai pour les changements d'auth
          if (isNative && event !== 'INITIAL_SESSION') {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          setSession(session);
          setUser(session?.user ?? null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [authInitialized]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
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
              element={user ? <Index /> : <Landing />} 
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
              element={user ? <ExpenseAnalysis /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/analytics" 
              element={user ? <ExpenseAnalysis /> : <Navigate to="/auth" replace />} 
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
