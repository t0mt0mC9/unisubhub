import { useIsMobile, useIsNativePlatform } from "@/hooks/use-mobile";
import { StripeSubscriptionPlans } from "./stripe-subscription-plans";
import { MobileSubscriptionPlans } from "./mobile-subscription-plans";

interface UnifiedSubscriptionManagerProps {
  userId?: string;
  onSubscriptionChange?: (isActive: boolean) => void;
}

export const UnifiedSubscriptionManager = ({ userId, onSubscriptionChange }: UnifiedSubscriptionManagerProps) => {
  const isMobile = useIsMobile();
  const isNative = useIsNativePlatform();

  // Utiliser RevenueCat si on est sur une plateforme native (iOS/Android)
  // ou sur mobile pour simuler l'expérience mobile
  // Utiliser Stripe pour desktop/web
  if (isNative || isMobile) {
    return <MobileSubscriptionPlans />;
  }

  return <StripeSubscriptionPlans />;
};