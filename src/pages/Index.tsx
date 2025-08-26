import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/ui/mobile-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { SpendingOverview } from "@/components/dashboard/spending-overview";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { AnalyticsStats } from "@/components/analytics/analytics-stats";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts";
import { DealabsOffers } from "@/components/deals/dealabs-offers";
import { SettingsPage } from "@/components/settings/settings-page";
import { SubscriptionPlans } from "@/components/subscription/subscription-plans";
import { AddSubscriptionDialog } from "@/components/add-subscription/add-subscription-dialog";
import { ProfilePage } from "@/components/profile/profile-page";
import { PrivacyPolicyPage } from "@/components/privacy/privacy-policy-page";
import PremiumPage from "@/components/subscription/premium-page";
import { OnboardingOverlay } from "@/components/onboarding/onboarding-overlay";
import { mockSubscriptions, calculateTotalSpending } from "@/data/mock-subscriptions";
import { useUserSettings } from "@/hooks/use-user-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { updateExpiredBillingDates } from "@/lib/subscription-updater";
import { Search, Filter, Plus, BarChart3, Settings, LogOut, X, Bell } from "lucide-react";


const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [displayedMockSubscriptions, setDisplayedMockSubscriptions] = useState<any[]>([]);
  const [analyticsTab, setAnalyticsTab] = useState<'offers' | 'analytics'>('offers');
  
  const { settings, getCurrencySymbol } = useUserSettings();
  
  // Récupérer les informations utilisateur pour le message de bienvenue
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();
  }, []);

  const getUserDisplayName = () => {
    if (!user) return '';
    
    // Essayer d'abord les user_metadata
    const fullName = user.user_metadata?.full_name;
    if (fullName) {
      return fullName.split(' ')[0]; // Prendre juste le prénom
    }
    
    // Fallback sur l'email si pas de nom
    return user.email?.split('@')[0] || '';
  };

  // Filter subscriptions based on search term
  const allSubscriptions = [...displayedMockSubscriptions, ...userSubscriptions];
  const spendingData = calculateTotalSpending(allSubscriptions);
  const { toast } = useToast();

  // Initialize mock subscriptions with localStorage persistence
  useEffect(() => {
    const deletedMockIds = JSON.parse(localStorage.getItem('deletedMockSubscriptions') || '[]');
    const filteredMockSubscriptions = mockSubscriptions.filter(sub => !deletedMockIds.includes(sub.id));
    setDisplayedMockSubscriptions(filteredMockSubscriptions);
  }, []);

  // Delete mock subscription function with localStorage persistence
  const handleDeleteMockSubscription = (id: string) => {
    // Update displayed subscriptions
    setDisplayedMockSubscriptions(prev => prev.filter(sub => sub.id !== id));
    
    // Store deleted IDs in localStorage
    const deletedMockIds = JSON.parse(localStorage.getItem('deletedMockSubscriptions') || '[]');
    if (!deletedMockIds.includes(id)) {
      deletedMockIds.push(id);
      localStorage.setItem('deletedMockSubscriptions', JSON.stringify(deletedMockIds));
    }
  };

  const filteredSubscriptions = allSubscriptions.filter(subscription =>
    subscription.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check for first-time user and show onboarding
  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if user has seen onboarding before
        const hasSeenOnboarding = localStorage.getItem(`onboarding_completed_${user.id}`);
        
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Error checking first-time user:", error);
      }
    };

    checkFirstTimeUser();
  }, []);

  // Load user subscriptions
  const loadSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Loading subscriptions for user:', user.id);
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log('Loaded subscriptions:', data);
      setUserSubscriptions(data || []);
    } catch (error: any) {
      console.error("Error loading subscriptions:", error);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      // Actualiser les dates de facturation expirées au démarrage
      await updateExpiredBillingDates();
      
      // Charger les abonnements après la mise à jour
      await loadSubscriptions();
    };

    initializeApp();

    // Listen for real-time updates
    const channel = supabase
      .channel('subscriptions_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscriptions'
      }, (payload) => {
        console.log('Real-time update received:', payload);
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

  const handleCompleteOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
      }
    } catch (error) {
      console.error("Error saving onboarding completion:", error);
    }
    setShowOnboarding(false);
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
        </div>

        {/* Message de bienvenue personnalisé */}
        {user && (
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Bonjour {getUserDisplayName()} 👋
            </h1>
            <p className="text-muted-foreground">
              Gérez vos abonnements facilement avec UniSubHub
            </p>
          </div>
        )}

        {/* Spending Overview */}
        <SpendingOverview
          totalMonthly={spendingData.totalMonthly}
          totalYearly={spendingData.totalYearly}
          currency={getCurrencySymbol()}
          monthlyChange={spendingData.monthlyChange}
          activeSubscriptions={spendingData.activeCount}
        />

        {/* Quick Actions */}
        <div className="flex justify-center">
          <Button 
            className="flex-1 max-w-xs" 
            size="lg"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
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
                  id={subscription.id}
                  name={subscription.name}
                  price={subscription.price}
                  currency={subscription.currency || '€'}
                  renewalDate={subscription.next_billing_date || subscription.renewalDate}
                  category={subscription.category}
                  icon={subscription.icon || '📱'}
                  status={subscription.status || 'active'}
                  daysUntilRenewal={subscription.daysUntilRenewal}
                  billingCycle={subscription.billing_cycle}
                  subscription={subscription}
                  onRefresh={loadSubscriptions}
                  onDeleteMockSubscription={handleDeleteMockSubscription}
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

  const renderOffers = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Offres d'abonnements</h2>
          <p className="text-muted-foreground">Découvrez les meilleures offres du moment</p>
        </div>
        
        <DealabsOffers userSubscriptions={allSubscriptions} />
        
        {/* Bottom spacing for fixed navigation */}
        <div className="h-6" />
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Analyses détaillées</h2>
          <p className="text-muted-foreground">Analysez vos dépenses d'abonnements</p>
        </div>
        
        <div className="space-y-6">
          <AnalyticsStats subscriptions={allSubscriptions} />
          <AnalyticsCharts subscriptions={allSubscriptions} />
        </div>
        
        {/* Bottom spacing for fixed navigation */}
        <div className="h-20" />
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Paramètres</h2>
          <p className="text-muted-foreground">Personnalisez votre expérience UniSubHub</p>
        </div>
        
        <SettingsPage 
          onSignOut={handleSignOut} 
          onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)}
        />
      </div>
    </div>
  );

  const renderPrivacyPolicy = () => (
    <PrivacyPolicyPage onBack={() => setShowPrivacyPolicy(false)} />
  );

  const getPageTitle = () => {
    if (showPrivacyPolicy) return 'Politique de confidentialité';
    
    switch (activeTab) {
      case 'dashboard': return 'UniSubHub';
      case 'offers': return 'Offres';
      case 'analytics': return 'Analyses';
      case 'settings': return 'Paramètres';
      case 'subscription': return 'Premium';
      case 'profile': return 'Profil';
      default: return 'UniSubHub';
    }
  };

  const renderContent = () => {
    if (showPrivacyPolicy) {
      return renderPrivacyPolicy();
    }
    
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'offers': return renderOffers();
      case 'analytics': return renderAnalytics();
      case 'settings': return renderSettings();
      case 'subscription': return renderSubscription();
      case 'profile': return renderProfile();
      default: return renderDashboard();
    }
  };

  const renderSubscription = () => <PremiumPage />;

  const renderProfile = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Mon Profil</h2>
          <p className="text-muted-foreground">Gérez vos informations personnelles</p>
        </div>
        
        <ProfilePage onSignOut={handleSignOut} />
      </div>
    </div>
  );

  

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader 
        title={getPageTitle()} 
        onSettingsClick={() => setActiveTab('settings')}
        onProfileClick={() => setActiveTab('profile')}
      />
      {renderContent()}
      {!showPrivacyPolicy && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}
      <AddSubscriptionDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onSubscriptionAdded={loadSubscriptions}
      />
      {showOnboarding && (
        <OnboardingOverlay onComplete={handleCompleteOnboarding} />
      )}
    </div>
  );
};

export default Index;
