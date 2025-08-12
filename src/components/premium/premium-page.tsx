import { useEffect } from "react";
import { Star, Gift, Crown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PremiumHeader } from "./premium-header";
import { ReferralStatsCards } from "./referral-stats";
import { ReferralInvite } from "./referral-invite";
import { ReferralList } from "./referral-list";
import { SubscriptionManager } from "../subscription/subscription-manager";
import { useReferrals } from "@/hooks/use-referrals";
import { useStoreKitSubscription } from "@/hooks/use-storekit-subscription";

export default function PremiumPage() {
  const {
    referrals,
    myReferralCode,
    currentUser,
    stats,
    sendInvitation,
    deleteReferral,
    copyReferralLink,
    shareViaEmail
  } = useReferrals();

  const { identifyUser } = useStoreKitSubscription();

  useEffect(() => {
    if (currentUser?.id) {
      identifyUser(currentUser.id);
    }
  }, [currentUser, identifyUser]);

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="mx-auto max-w-4xl space-y-6">
        <PremiumHeader />

        {/* Tabs */}
        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Plans Premium
            </TabsTrigger>
            <TabsTrigger value="referral" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Parrainage
            </TabsTrigger>
          </TabsList>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <SubscriptionManager 
              userId={currentUser?.id}
              onSubscriptionChange={(isActive) => {
                console.log('Subscription status changed:', isActive);
              }}
            />
          </TabsContent>

          {/* Referral Tab */}
          <TabsContent value="referral" className="space-y-6">
            {/* Referral Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full">
                <Crown className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Programme de Parrainage
                </span>
              </div>
              <h2 className="text-2xl font-bold">Invite tes amis</h2>
              <p className="text-muted-foreground">
                <strong>2 amis invités = 1 mois offert</strong> sur ton abonnement Premium
              </p>
            </div>

            {/* Stats Cards */}
            <ReferralStatsCards stats={stats} />

            {/* Invite Section */}
            <ReferralInvite
              myReferralCode={myReferralCode}
              onSendInvitation={sendInvitation}
              onCopyLink={copyReferralLink}
              onShareEmail={shareViaEmail}
            />

            {/* Referrals List */}
            <ReferralList
              referrals={referrals}
              onDeleteReferral={deleteReferral}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}