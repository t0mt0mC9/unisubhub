import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "✅ Paiement réussi !",
      description: "Votre abonnement est maintenant actif.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Paiement réussi !</h1>
          <p className="text-muted-foreground mb-6">
            Votre abonnement est maintenant actif. Vous pouvez retourner à l'application.
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="w-full"
          >
            Retourner à l'application
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;