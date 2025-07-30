import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/ui/mobile-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { SpendingOverview } from "@/components/dashboard/spending-overview";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { AddSubscriptionDialog } from "@/components/add-subscription/add-subscription-dialog";
import { mockSubscriptions, calculateTotalSpending } from "@/data/mock-subscriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, Plus, BarChart3, Settings, LogOut, X } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const spendingData = calculateTotalSpending(mockSubscriptions);
  const { toast } = useToast();

  // Filter subscriptions based on search term
  const allSubscriptions = [...mockSubscriptions, ...userSubscriptions];
  const filteredSubscriptions = allSubscriptions.filter(subscription =>
    subscription.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load user subscriptions
  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setUserSubscriptions(data || []);
      } catch (error: any) {
        console.error("Error loading subscriptions:", error);
      } finally {
        setLoadingSubscriptions(false);
      }
    };

    loadSubscriptions();

    // Listen for real-time updates
    const channel = supabase
      .channel('subscriptions_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscriptions'
      }, () => {
        loadSubscriptions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher vos abonnements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
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
          <Button 
            className="flex-1" 
            size="lg"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un abonnement
          </Button>
        </div>

        {/* Subscriptions List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {searchTerm ? `Résultats pour "${searchTerm}"` : 'Mes abonnements'}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredSubscriptions.length} {searchTerm ? 'trouvé(s)' : 'au total'}
            </span>
          </div>
          
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Aucun abonnement trouvé</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Essayez un autre terme de recherche'
                  : 'Vous n\'avez pas encore d\'abonnements'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  {...subscription}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom spacing for fixed navigation */}
        <div className="h-6" />
      </div>
    </div>
  );

  const renderAddSubscription = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4">
        <AddSubscriptionDialog 
          open={true} 
          onOpenChange={() => setActiveTab('dashboard')} 
        />
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
      <AddSubscriptionDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};

export default Index;
