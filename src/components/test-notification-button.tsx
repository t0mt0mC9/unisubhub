import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const TestNotificationButton = () => {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const sendTestNotification = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-notification', {
        body: {
          userEmail: 'tom.lifert@gmail.com',
          subscriptionName: 'Netflix',
          renewalDate: '2025-08-27',
          testMessage: '🔔 Rappel : Netflix se renouvelle demain (27/08/2025) - Test UniSubHub'
        }
      });

      if (error) {
        console.error('Error sending test notification:', error);
        throw error;
      }

      console.log('Test notification response:', data);

      toast({
        title: "✅ Notification de test envoyée",
        description: `Notification push envoyée à tom.lifert@gmail.com pour Netflix`,
      });

    } catch (error: any) {
      console.error('Failed to send test notification:', error);
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible d'envoyer la notification de test",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={sendTestNotification}
      disabled={loading}
      variant="outline"
      size="lg"
      className="w-full"
    >
      <Bell className="mr-2 h-4 w-4" />
      {loading ? 'Envoi...' : 'Test Notif'}
    </Button>
  );
};