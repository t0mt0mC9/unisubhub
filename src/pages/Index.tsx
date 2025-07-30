import { useState } from "react";
import { MobileHeader } from "@/components/ui/mobile-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { SpendingOverview } from "@/components/dashboard/spending-overview";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { mockSubscriptions, calculateTotalSpending } from "@/data/mock-subscriptions";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, Plus, BarChart3, Settings, LogOut } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const spendingData = calculateTotalSpending(mockSubscriptions);
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur UniSubHub",
      });
      window.location.href = '/auth';
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const renderDashboard = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4 space-y-6">
        {/* Search and filter */}
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1 justify-start" size="lg">
            <Search className="mr-2 h-4 w-4" />
            Rechercher vos abonnements...
          </Button>
          <Button variant="outline" size="lg">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Spending Overview */}
        <SpendingOverview
          totalMonthly={spendingData.totalMonthly}
          totalYearly={spendingData.totalYearly}
          currency="€"
          monthlyChange={spendingData.monthlyChange}
          activeSubscriptions={spendingData.activeCount}
        />

        {/* Quick Actions */}
        <div className="flex space-x-3">
          <Button className="flex-1" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un abonnement
          </Button>
        </div>

        {/* Subscriptions List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Mes abonnements</h2>
            <span className="text-sm text-muted-foreground">{mockSubscriptions.length} au total</span>
          </div>
          
          <div className="space-y-3">
            {mockSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                {...subscription}
              />
            ))}
          </div>
        </div>

        {/* Bottom spacing for fixed navigation */}
        <div className="h-6" />
      </div>
    </div>
  );

  const renderAddSubscription = () => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
          <Plus className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Ajouter un abonnement</h2>
        <p className="text-muted-foreground">Cette fonctionnalité sera bientôt disponible</p>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
          <BarChart3 className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-xl font-semibold">Analyses détaillées</h2>
        <p className="text-muted-foreground">Vos statistiques et recommandations d'optimisation</p>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
            <Settings className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-xl font-semibold">Paramètres</h2>
          <p className="text-muted-foreground">Personnalisez votre expérience UniSubHub</p>
        </div>
        
        <div className="space-y-4">
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="w-full"
            size="lg"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'UniSubHub';
      case 'add': return 'Ajouter';
      case 'analytics': return 'Analyses';
      case 'settings': return 'Paramètres';
      default: return 'UniSubHub';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'add': return renderAddSubscription();
      case 'analytics': return renderAnalytics();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader title={getPageTitle()} />
      {renderContent()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
