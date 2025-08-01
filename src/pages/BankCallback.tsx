import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

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

export const BankCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedSubscriptions, setDetectedSubscriptions] = useState<DetectedSubscription[]>([]);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Récupérer les paramètres de l'URL
        const state = searchParams.get('state');
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Erreur de connexion bancaire: ${error}`);
        }

        if (!code) {
          throw new Error('Code d\'autorisation manquant');
        }

        console.log('Callback reçu:', { state, code: code?.substring(0, 10) + '***' });

        // Récupérer les informations de connexion stockées
        const storedConnection = localStorage.getItem('powens_connection');
        if (!storedConnection) {
          throw new Error('Informations de connexion manquantes');
        }

        const { user_token, bank_id } = JSON.parse(storedConnection);

        // Appeler la fonction edge pour récupérer les transactions
        const { data, error: supabaseError } = await supabase.functions.invoke('budget-insight-connect', {
          body: {
            action: 'get_transactions',
            user_token: user_token,
          },
        });

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        if (data?.success && data.detected_subscriptions) {
          setDetectedSubscriptions(data.detected_subscriptions);
          setSuccess(true);
          
          toast({
            title: "Connexion réussie",
            description: `${data.detected_subscriptions.length} abonnement(s) détecté(s)`,
          });
        } else {
          throw new Error('Aucun abonnement détecté');
        }

      } catch (err: any) {
        console.error('Erreur callback:', err);
        setError(err.message);
        toast({
          title: "Erreur",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams]);

  const handleImportAll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const subscriptionsToImport = detectedSubscriptions.map(sub => ({
        user_id: user.id,
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        billing_cycle: sub.billing_cycle,
        category: sub.category,
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        auto_detected: true,
      }));

      const { error } = await supabase
        .from('subscriptions')
        .insert(subscriptionsToImport);

      if (error) {
        throw error;
      }

      toast({
        title: "Succès",
        description: `${subscriptionsToImport.length} abonnement(s) importé(s) avec succès`,
      });

      // Nettoyer le localStorage et rediriger
      localStorage.removeItem('powens_connection');
      navigate('/');
    } catch (error: any) {
      console.error('Erreur import:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReturn = () => {
    localStorage.removeItem('powens_connection');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <h2 className="text-lg font-semibold">Traitement en cours...</h2>
                <p className="text-sm text-muted-foreground">
                  Analyse de vos transactions bancaires
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-8 w-8 text-destructive" />
              <div className="text-center">
                <h2 className="text-lg font-semibold">Erreur de connexion</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {error}
                </p>
                <Button onClick={handleReturn}>
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Connexion bancaire réussie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {detectedSubscriptions.length} abonnement(s) détecté(s) dans vos transactions
              </p>
              
              <div className="space-y-2">
                {detectedSubscriptions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{sub.name}</h3>
                      <p className="text-sm text-muted-foreground">{sub.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{sub.price} {sub.currency}</p>
                      <p className="text-sm text-muted-foreground">{sub.billing_cycle}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleImportAll} className="flex-1">
                  Importer tous les abonnements
                </Button>
                <Button variant="outline" onClick={handleReturn}>
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};