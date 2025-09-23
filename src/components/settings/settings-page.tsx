import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/use-notifications";
import { BudgetProgressBar } from "@/components/budget/budget-progress-bar";
import { 
  Settings, 
  Bell, 
  Euro, 
  Shield, 
  User, 
  LogOut,
  Trash2,
  HelpCircle,
  DollarSign,
  Calendar,
  Mail,
  MessageCircle,
  Sparkles
} from "lucide-react";

interface SettingsPageProps {
  onSignOut: () => void;
  onShowPrivacyPolicy: () => void;
}

export const SettingsPage = ({ onSignOut, onShowPrivacyPolicy }: SettingsPageProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { settings, updateSettings, loading } = useNotifications();

  const [aiConsent, setAiConsent] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showBudgetConfirm, setShowBudgetConfirm] = useState(false);
  const [pendingBudgetValue, setPendingBudgetValue] = useState<string>("");
  const [currentBudgetInput, setCurrentBudgetInput] = useState<string>("");

  useEffect(() => {
    // Initialiser l'input avec la valeur actuelle du budget
    setCurrentBudgetInput(settings.budgetLimit.toString());
  }, [settings.budgetLimit]);

  useEffect(() => {
    const loadConsent = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('ai_insights_consent')
          .eq('id', user.id)
          .single();
        if (!error && profile) {
          setAiConsent(!!profile.ai_insights_consent);
        }
      } catch (e) {
        console.error('Load AI consent error:', e);
      }
    };
    loadConsent();
  }, []);

  const handleToggleAIConsent = async (checked: boolean) => {
    setAiLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Connexion requise", description: "Veuillez vous connecter pour activer l'IA.", variant: "destructive" });
        return;
      }
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ai_insights_consent: checked }, { onConflict: 'id' });
      if (error) throw error;
      setAiConsent(checked);
      toast({
        title: checked ? "Prédictions IA activées" : "Prédictions IA désactivées",
        description: checked ? "Les graphiques utiliseront Perplexity quand c'est possible." : "Nous utiliserons des données locales.",
      });
    } catch (e: any) {
      console.error('Toggle AI consent error:', e);
      toast({ title: "Erreur", description: e.message || "Impossible de mettre à jour le consentement", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Call the delete account edge function for complete account deletion
      const { data, error } = await supabase.functions.invoke('delete-user-account');

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Compte supprimé",
          description: "Votre compte et toutes vos données ont été définitivement supprimés",
        });
        
        // Clear all auth state and redirect
        await supabase.auth.signOut({ scope: 'global' });
        
        // Navigate without page reload
        navigate('/auth');
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression du compte",
        variant: "destructive",
      });
    }
  };

  const handleBudgetChange = (newValue: string) => {
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue > 0 && numValue !== settings.budgetLimit) {
      setPendingBudgetValue(newValue);
      setShowBudgetConfirm(true);
    }
  };

  const handleBudgetInputChange = (value: string) => {
    // Permettre seulement les nombres et limiter à 4 chiffres
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 4) {
      setCurrentBudgetInput(numericValue);
    }
  };

  const handleBudgetBlur = () => {
    if (currentBudgetInput && currentBudgetInput !== settings.budgetLimit.toString()) {
      handleBudgetChange(currentBudgetInput);
    }
  };

  const handleBudgetKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (currentBudgetInput && currentBudgetInput !== settings.budgetLimit.toString()) {
        handleBudgetChange(currentBudgetInput);
      }
    }
  };

  const confirmBudgetChange = () => {
    if (pendingBudgetValue) {
      const newBudget = parseFloat(pendingBudgetValue);
      console.log('💰 Confirmation budget change vers:', newBudget);
      
      // Mettre à jour les deux hooks en parallèle
      updateSettings({ budgetLimit: newBudget });
      
      setCurrentBudgetInput(pendingBudgetValue); // Synchroniser l'input
      
      // Déclencher un événement personnalisé pour forcer la mise à jour de la barre
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('budgetUpdated', { 
          detail: { newBudget }
        }));
      }, 200); // Petit délai pour laisser le temps à la sauvegarde
      
      toast({
        title: "Budget mis à jour",
        description: `Nouvelle limite de budget: ${pendingBudgetValue}€`,
      });
    }
    setShowBudgetConfirm(false);
    setPendingBudgetValue("");
  };

  const cancelBudgetChange = () => {
    setCurrentBudgetInput(settings.budgetLimit.toString()); // Remettre l'ancienne valeur
    setShowBudgetConfirm(false);
    setPendingBudgetValue("");
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configurez vos préférences de notification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <div>
                <Label>Alertes budget</Label>
                <div className="text-sm text-muted-foreground">
                  Être alerté en cas de dépassement
                </div>
              </div>
            </div>
            <Switch
              checked={settings.budgetAlerts}
              onCheckedChange={(checked) => updateSettings({ budgetAlerts: checked })}
              disabled={loading}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <div>
                <Label>Rappels facturation</Label>
                <div className="text-sm text-muted-foreground">
                  Rappels la veille de la facturation
                </div>
              </div>
            </div>
            <Switch
              checked={settings.renewalAlerts}
              onCheckedChange={(checked) => updateSettings({ renewalAlerts: checked })}
              disabled={loading}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <div>
                <Label>Notifications d'offres</Label>
                <div className="text-sm text-muted-foreground">
                  Alertes pour nouvelles offres Dealabs correspondantes
                </div>
              </div>
            </div>
            <Switch
              checked={settings.offerNotifications}
              onCheckedChange={(checked) => updateSettings({ offerNotifications: checked })}
              disabled={loading}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <Label>Résumé mensuel</Label>
                <div className="text-sm text-muted-foreground">
                  Recevoir un résumé détaillé chaque mois par email
                </div>
              </div>
            </div>
            <Switch
              checked={settings.monthlySummary}
              onCheckedChange={(checked) => updateSettings({ monthlySummary: checked })}
              disabled={loading}
            />
          </div>
          
        </CardContent>
      </Card>

      {/* IA - Prédictions intelligentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Prédictions intelligentes (IA)
          </CardTitle>
          <CardDescription>
            Activez les prédictions Perplexity pour des projections personnalisées
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activer les prédictions IA</Label>
              <div className="text-sm text-muted-foreground">
                Utilise l'IA Perplexity avec votre consentement explicite.
              </div>
            </div>
            <Switch
              checked={aiConsent}
              onCheckedChange={handleToggleAIConsent}
              disabled={aiLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget mensuel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Budget mensuel moyen à ne pas dépasser (€)</Label>
            <Input
              id="budget"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={currentBudgetInput}
              onChange={(e) => handleBudgetInputChange(e.target.value)}
              onBlur={handleBudgetBlur}
              onKeyPress={handleBudgetKeyPress}
              placeholder="100"
              disabled={loading}
              maxLength={4}
            />
            <div className="text-sm text-muted-foreground">
              Vous serez alerté si vos dépenses dépassent ce montant
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barre de progression budget */}
      <BudgetProgressBar />

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Support
          </CardTitle>
          <CardDescription>
            Besoin d'aide ? Contactez notre équipe support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.open('mailto:thomas.lifert@city-fix.fr?subject=Support UniSubHub - Demande d\'aide', '_blank')}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Contact support
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Données et confidentialité
          </CardTitle>
          <CardDescription>
            Gérez vos données et votre vie privée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={onShowPrivacyPolicy} className="w-full">
            <HelpCircle className="mr-2 h-4 w-4" />
            Politique de confidentialité
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.open('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/', '_blank')}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Conditions d'utilisation (EULA)
          </Button>
          
          <Separator />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer mon compte
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer définitivement votre compte ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Toutes vos données, y compris vos abonnements et paramètres, seront définitivement supprimées.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Supprimer définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            variant="destructive" 
            onClick={onSignOut}
            className="w-full"
            size="lg"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation de modification du budget */}
      <AlertDialog open={showBudgetConfirm} onOpenChange={setShowBudgetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifier le budget limite ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous souhaitez changer votre budget mensuel limite de{" "}
              <strong>{settings.budgetLimit}€</strong> à{" "}
              <strong>{pendingBudgetValue}€</strong>.
              <br /><br />
              Cette modification affectera vos alertes de budget et la barre de progression.
              {pendingBudgetValue && settings.budgetLimit > parseFloat(pendingBudgetValue) && (
                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-orange-800 text-sm">
                  ⚠️ Attention : Réduire votre budget peut déclencher des alertes si vos dépenses actuelles dépassent la nouvelle limite.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelBudgetChange}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmBudgetChange}>
              Confirmer la modification
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};