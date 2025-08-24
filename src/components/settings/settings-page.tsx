import { useState, useEffect } from "react";
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
import { 
  Settings, 
  Bell, 
  Euro, 
  Shield, 
  User, 
  LogOut,
  Trash2,
  HelpCircle
} from "lucide-react";

interface SettingsPageProps {
  onSignOut: () => void;
  onShowPrivacyPolicy: () => void;
}

export const SettingsPage = ({ onSignOut, onShowPrivacyPolicy }: SettingsPageProps) => {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [renewalAlerts, setRenewalAlerts] = useState(true);
  const [currency, setCurrency] = useState("EUR");
  const [budgetLimit, setBudgetLimit] = useState("100");
  
  const { toast } = useToast();

  // Charger les paramètres sauvegardés au montage du composant
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const savedCurrency = localStorage.getItem(`preferred_currency_${user.id}`);
          const savedBudget = localStorage.getItem(`budget_limit_${user.id}`);
          const savedNotifications = localStorage.getItem(`notifications_${user.id}`);
          
          if (savedCurrency) setCurrency(savedCurrency);
          if (savedBudget) setBudgetLimit(savedBudget);
          if (savedNotifications) {
            const notifSettings = JSON.parse(savedNotifications);
            setNotifications(notifSettings.notifications);
            setEmailNotifications(notifSettings.emailNotifications);
            setBudgetAlerts(notifSettings.budgetAlerts);
            setRenewalAlerts(notifSettings.renewalAlerts);
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Sauvegarder la devise préférée dans localStorage
        localStorage.setItem(`preferred_currency_${user.id}`, currency);
        localStorage.setItem(`budget_limit_${user.id}`, budgetLimit);
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify({
          notifications,
          emailNotifications,
          budgetAlerts,
          renewalAlerts
        }));
      }
      
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences ont été mises à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
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
        
        // Force a complete page reload to clear all state
        window.location.href = '/auth';
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

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profil utilisateur
          </CardTitle>
          <CardDescription>
            Gérez vos informations personnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">Nom d'affichage</Label>
            <Input id="display-name" placeholder="Votre nom" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="votre@email.com" />
          </div>
          <Button onClick={handleSaveSettings}>
            Sauvegarder les modifications
          </Button>
        </CardContent>
      </Card>

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
            <div className="space-y-0.5">
              <Label>Notifications push</Label>
              <div className="text-sm text-muted-foreground">
                Recevoir des notifications sur votre appareil
              </div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications email</Label>
              <div className="text-sm text-muted-foreground">
                Recevoir des résumés par email
              </div>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alertes budget</Label>
              <div className="text-sm text-muted-foreground">
                Être alerté en cas de dépassement
              </div>
            </div>
            <Switch
              checked={budgetAlerts}
              onCheckedChange={setBudgetAlerts}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Rappels renouvellement</Label>
              <div className="text-sm text-muted-foreground">
                Rappels avant échéance
              </div>
            </div>
            <Switch
              checked={renewalAlerts}
              onCheckedChange={setRenewalAlerts}
            />
          </div>
        </CardContent>
      </Card>

      {/* Budget & Currency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Budget et devise
          </CardTitle>
          <CardDescription>
            Configurez votre budget mensuel et votre devise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Devise préférée</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">Euro (€)</SelectItem>
                <SelectItem value="USD">Dollar américain ($)</SelectItem>
                <SelectItem value="GBP">Livre sterling (£)</SelectItem>
                <SelectItem value="CHF">Franc suisse (CHF)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="budget">Budget mensuel (€)</Label>
            <Input
              id="budget"
              type="number"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              placeholder="100"
            />
          </div>
        </CardContent>
      </Card>


      {/* Data & Privacy */}
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
    </div>
  );
};