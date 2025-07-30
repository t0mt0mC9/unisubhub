import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  Shield,
  Eye,
  EyeOff
} from "lucide-react";

interface BankConnectionFormProps {
  onSuccess: () => void;
}

interface DetectedSubscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_cycle: string;
  category: string;
  last_transaction_date: string;
  confidence: number;
}

const mockBanks = [
  { id: "bnp", name: "BNP Paribas", logo: "🏦" },
  { id: "credit_agricole", name: "Crédit Agricole", logo: "🌾" },
  { id: "societe_generale", name: "Société Générale", logo: "🏛️" },
  { id: "lcl", name: "LCL", logo: "🏪" },
  { id: "credit_mutuel", name: "Crédit Mutuel", logo: "🤝" },
];

const mockDetectedSubscriptions: DetectedSubscription[] = [
  {
    id: "1",
    name: "Netflix",
    price: 13.49,
    currency: "EUR",
    billing_cycle: "monthly",
    category: "Streaming",
    last_transaction_date: "2024-01-15",
    confidence: 95
  },
  {
    id: "2", 
    name: "Spotify Premium",
    price: 9.99,
    currency: "EUR",
    billing_cycle: "monthly",
    category: "Musique",
    last_transaction_date: "2024-01-10",
    confidence: 90
  },
  {
    id: "3",
    name: "Adobe Creative Cloud",
    price: 59.99,
    currency: "EUR", 
    billing_cycle: "monthly",
    category: "Design & Créativité",
    last_transaction_date: "2024-01-05",
    confidence: 85
  }
];

export const BankConnectionForm = ({ onSuccess }: BankConnectionFormProps) => {
  const [step, setStep] = useState<'select-bank' | 'credentials' | 'detecting' | 'results'>('select-bank');
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detectedSubscriptions, setDetectedSubscriptions] = useState<DetectedSubscription[]>([]);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const { toast } = useToast();

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    setStep('credentials');
  };

  const handleConnect = async () => {
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setStep('detecting');

    // Simulation de la connexion bancaire
    setTimeout(() => {
      setDetectedSubscriptions(mockDetectedSubscriptions);
      setSelectedSubscriptions(mockDetectedSubscriptions.map(s => s.id));
      setStep('results');
      setLoading(false);
    }, 3000);
  };

  const handleImportSelected = async () => {
    const selectedSubs = detectedSubscriptions.filter(sub => 
      selectedSubscriptions.includes(sub.id)
    );

    if (selectedSubs.length === 0) {
      toast({
        title: "Aucun abonnement sélectionné",
        description: "Veuillez sélectionner au moins un abonnement à importer",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const subscriptionsToInsert = selectedSubs.map(sub => ({
        user_id: user.id,
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        billing_cycle: sub.billing_cycle,
        category: sub.category,
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Dans 30 jours
        auto_detected: true,
        status: "active"
      }));

      const { error } = await supabase.from("subscriptions").insert(subscriptionsToInsert);

      if (error) throw error;

      toast({
        title: "Abonnements importés",
        description: `${selectedSubs.length} abonnement(s) ont été importés avec succès`,
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscriptionSelection = (id: string) => {
    setSelectedSubscriptions(prev => 
      prev.includes(id) 
        ? prev.filter(subId => subId !== id)
        : [...prev, id]
    );
  };

  if (step === 'select-bank') {
    return (
      <div className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Connexion sécurisée conforme PSD2. Vos données bancaires sont chiffrées et ne sont jamais stockées.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Label>Sélectionnez votre banque</Label>
          <div className="grid grid-cols-1 gap-3">
            {mockBanks.map((bank) => (
              <Card 
                key={bank.id}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedBank === bank.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleBankSelect(bank.id)}
              >
                <CardContent className="flex items-center space-x-3 p-4">
                  <span className="text-2xl">{bank.logo}</span>
                  <span className="font-medium">{bank.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'credentials') {
    const selectedBankData = mockBanks.find(b => b.id === selectedBank);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{selectedBankData?.logo}</span>
          <div>
            <h3 className="font-semibold">{selectedBankData?.name}</h3>
            <p className="text-sm text-muted-foreground">Connexion sécurisée</p>
          </div>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Utilisez vos identifiants habituels. La connexion est sécurisée et conforme aux normes bancaires européennes.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Identifiant</Label>
            <Input
              id="username"
              placeholder="Votre identifiant bancaire"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Votre mot de passe"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep('select-bank')}>
            Retour
          </Button>
          <Button onClick={handleConnect} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'detecting') {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Analyse en cours...</h3>
          <p className="text-muted-foreground">
            Nous analysons vos transactions pour détecter vos abonnements automatiquement.
          </p>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {detectedSubscriptions.length} abonnement(s) détecté(s)
          </h3>
          <p className="text-muted-foreground">
            Sélectionnez les abonnements que vous souhaitez importer
          </p>
        </div>

        <div className="space-y-3">
          {detectedSubscriptions.map((subscription) => (
            <Card 
              key={subscription.id}
              className={`cursor-pointer transition-colors ${
                selectedSubscriptions.includes(subscription.id) 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-accent'
              }`}
              onClick={() => toggleSubscriptionSelection(subscription.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{subscription.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {subscription.confidence}% de confiance
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {subscription.price} {subscription.currency} / {
                          subscription.billing_cycle === 'monthly' ? 'mois' :
                          subscription.billing_cycle === 'yearly' ? 'an' : 'semaine'
                        }
                      </p>
                    </div>
                  </div>
                  {selectedSubscriptions.includes(subscription.id) && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep('select-bank')}>
            Nouvelle recherche
          </Button>
          <Button onClick={handleImportSelected} disabled={loading || selectedSubscriptions.length === 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Importer ({selectedSubscriptions.length})
          </Button>
        </div>
      </div>
    );
  }

  return null;
};