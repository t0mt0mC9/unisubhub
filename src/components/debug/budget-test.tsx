import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const BudgetTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const testBudget = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Utilisateur non connecté",
          variant: "destructive",
        });
        return;
      }

      console.log('🧪 Test manuel de vérification du budget...');
      
      const { data, error } = await supabase.functions.invoke('check-budget-realtime', {
        body: { userId: user.id }
      });

      if (error) {
        toast({
          title: "Erreur",
          description: `Erreur lors du test: ${error.message}`,
          variant: "destructive",
        });
        console.error('Erreur test budget:', error);
        return;
      }

      setResult(data);
      
      if (data?.budget_exceeded) {
        toast({
          title: "⚠️ Budget dépassé",
          description: `Votre budget de ${data.budget_limit}€ est dépassé (${data.monthly_total?.toFixed(2)}€)`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Budget respecté",
          description: `Votre budget de ${data.budget_limit}€ est respecté (${data.monthly_total?.toFixed(2)}€)`,
        });
      }

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      console.error('Erreur test budget:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Test Budget
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testBudget} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Vérification...' : 'Tester les alertes budget'}
        </Button>
        
        {result && (
          <div className="text-sm space-y-2">
            <div className="p-3 bg-muted rounded-lg">
              <p><strong>Budget limite:</strong> {result.budget_limit}€</p>
              <p><strong>Total mensuel:</strong> {result.monthly_total?.toFixed(2)}€</p>
              <p><strong>Budget dépassé:</strong> {result.budget_exceeded ? '❌ Oui' : '✅ Non'}</p>
              {result.excess && (
                <p><strong>Excédent:</strong> +{result.excess?.toFixed(2)}€</p>
              )}
              {result.alert_sent && (
                <p className="text-green-600"><strong>Alerte envoyée:</strong> ✅</p>
              )}
              {result.alert_already_sent && (
                <p className="text-orange-600"><strong>Alerte déjà envoyée aujourd'hui</strong></p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};