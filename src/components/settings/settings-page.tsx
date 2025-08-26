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
import { useNotifications } from "@/hooks/use-notifications";
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
  Mail
} from "lucide-react";

interface SettingsPageProps {
  onSignOut: () => void;
  onShowPrivacyPolicy: () => void;
}

export const SettingsPage = ({ onSignOut, onShowPrivacyPolicy }: SettingsPageProps) => {
  const { toast } = useToast();
  const { settings, updateSettings, loading } = useNotifications();



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

      {/* Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget mensuel
          </CardTitle>
          <CardDescription>
            Configurez votre budget mensuel à ne pas dépasser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Budget mensuel à ne pas dépasser (€)</Label>
            <Input
              id="budget"
              type="number"
              value={settings.budgetLimit}
              onChange={(e) => updateSettings({ budgetLimit: Number(e.target.value) })}
              placeholder="100"
              disabled={loading}
            />
            <div className="text-sm text-muted-foreground">
              Vous serez alerté si vos dépenses dépassent ce montant
            </div>
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