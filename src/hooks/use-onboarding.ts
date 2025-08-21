import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Vérifier si l'utilisateur a déjà vu l'onboarding
        const onboardingCompleted = localStorage.getItem(`onboarding-completed-${user.id}`);
        
        // Si c'est un nouvel utilisateur (pas d'onboarding complété), le montrer
        if (!onboardingCompleted) {
          console.log('🎯 Nouvel utilisateur détecté - affichage de l\'onboarding');
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'onboarding:', error);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  const completeOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        localStorage.setItem(`onboarding-completed-${user.id}`, 'true');
        console.log('✅ Onboarding marqué comme complété');
      }
      setShowOnboarding(false);
    } catch (error) {
      console.error('Erreur lors de la complétion de l\'onboarding:', error);
      setShowOnboarding(false);
    }
  };

  return {
    showOnboarding,
    loading,
    completeOnboarding
  };
};