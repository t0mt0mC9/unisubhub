import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/use-subscription";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refresh, hasAccess, loading } = useSubscription();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSubscriptionAndRedirect = async () => {
      try {
        // Attendre un peu pour que Stripe traite le paiement
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Vérifier le statut de l'abonnement
        const subscriptionData = await refresh();

        if (subscriptionData?.subscribed || hasAccess) {
          toast({
            title: "✅ Paiement réussi !",
            description:
              "Votre abonnement est maintenant actif. Redirection...",
          });

          // Rediriger automatiquement vers l'application après 1 seconde
          setTimeout(() => {
            navigate("/");
          }, 1000);
        } else {
          // Si l'abonnement n'est pas encore actif, laisser l'utilisateur sur cette page
          setIsChecking(false);
          toast({
            title: "✅ Paiement reçu !",
            description:
              "Votre paiement est en cours de traitement. Vous pouvez retourner à l'application.",
          });
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'abonnement:", error);
        setIsChecking(false);
        toast({
          title: "✅ Paiement effectué !",
          description:
            "Veuillez retourner à l'application pour vérifier votre abonnement.",
        });
      }
    };

    checkSubscriptionAndRedirect();
  }, [refresh, hasAccess, navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          {isChecking ? (
            <>
              <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold mb-2">
                Vérification en cours...
              </h1>
              <p className="text-muted-foreground mb-6">
                Nous vérifions votre paiement et activons votre abonnement. Vous
                serez redirigé automatiquement.
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Paiement effectué !</h1>
              <p className="text-muted-foreground mb-6">
                Votre paiement a été traité avec succès. Vous pouvez retourner à
                l'application.
              </p>
              <Button onClick={() => navigate("/")} className="w-full">
                Retourner à l'application
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
