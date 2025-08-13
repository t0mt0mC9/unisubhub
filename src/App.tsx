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

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session and set loading to false immediately after
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false); // Always set loading to false after getting session
      }
    }).catch((error) => {
      console.error("Error getting session:", error);
      if (mounted) {
        setLoading(false); // Set loading to false even on error
      }
    });

    // Set up auth state listener for real-time changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          // Don't change loading state here - it should already be false
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
