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

        <div className="space-y-6">
          
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