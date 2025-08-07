import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CreditCard } from "lucide-react";

interface BankConnectionFormProps {
  onSuccess: () => void;
}

export const BankConnectionForm = ({ onSuccess }: BankConnectionFormProps) => {
  const { toast } = useToast();

  const handleConnectToPowens = () => {
    const powensUrl = "https://webview.powens.com/connect?domain=unisubhub-sandbox.biapi.pro&client_id=64557146&redirect_uri=https://lovable.dev/projects/c6cdb938-7790-42f1-abd3-9729bbdbc721";
    
    toast({
      title: "Redirection",
      description: "Vous allez être redirigé vers Powens pour connecter votre banque",
    });
    
    // Redirection vers Powens
    window.location.href = powensUrl;
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Connexion sécurisée conforme PSD2. Vos données bancaires sont chiffrées et ne sont jamais stockées.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Connecter votre banque</CardTitle>
          <CardDescription>
            Connectez-vous à votre banque via Powens pour détecter automatiquement vos abonnements
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={handleConnectToPowens} size="lg" className="w-full">
            Se connecter avec Powens
          </Button>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription className="text-sm">
          Après connexion, vous pourrez sélectionner les abonnements détectés à importer dans votre tableau de bord.
        </AlertDescription>
      </Alert>
    </div>
  );
};