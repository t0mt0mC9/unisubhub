import { useEffect } from "react";
import { Star } from "lucide-react";
import { PremiumHeader } from "./premium-header";
import { UnifiedSubscriptionManager } from "../subscription/unified-subscription-manager";
import { useStoreKitSubscription } from "@/hooks/use-storekit-subscription";
import { supabase } from "@/integrations/supabase/client";

export default function PremiumPage() {
  const { identifyUser } = useStoreKitSubscription();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        identifyUser(user.id);
      }
    };
    getCurrentUser();
  }, [identifyUser]);

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="mx-auto max-w-4xl space-y-6">
        <PremiumHeader />

        {/* Plans Premium */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full">
              <Star className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Plans Premium
              </span>
            </div>
            <h2 className="text-2xl font-bold">Passez au Premium</h2>
            <p className="text-muted-foreground">
              Débloquez toutes les fonctionnalités pour optimiser vos abonnements
            </p>
          </div>
          
          <UnifiedSubscriptionManager 
            onSubscriptionChange={(isActive) => {
              console.log('Subscription status changed:', isActive);
            }}
          />
        </div>
      </div>
    </div>
  );
}