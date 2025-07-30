import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Bell, 
  Euro, 
  Moon, 
  Sun, 
  Smartphone, 
  Mail, 
  Shield, 
  User, 
  LogOut,
  Download,
  Trash2,
  HelpCircle
} from "lucide-react";

interface SettingsPageProps {
  onSignOut: () => void;
}

export const SettingsPage = ({ onSignOut }: SettingsPageProps) => {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [renewalAlerts, setRenewalAlerts] = useState(true);
  const [currency, setCurrency] = useState("EUR");
  const [budgetLimit, setBudgetLimit] = useState("100");
  const [darkMode, setDarkMode] = useState(false);
  
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos préférences ont été mises à jour avec succès",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export en cours",
      description: "Vos données seront téléchargées dans quelques instants",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Suppression de compte",
      description: "Cette fonctionnalité sera bientôt disponible",
      variant: "destructive",
    });
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

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Apparence
          </CardTitle>
          <CardDescription>
            Personnalisez l'apparence de l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mode sombre</Label>
              <div className="text-sm text-muted-foreground">
                Basculer vers le thème sombre
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
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
          <Button variant="outline" onClick={handleExportData} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Exporter mes données
          </Button>
          
          <Button variant="outline" className="w-full">
            <HelpCircle className="mr-2 h-4 w-4" />
            Politique de confidentialité
          </Button>
          
          <Separator />
          
          <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer mon compte
          </Button>
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