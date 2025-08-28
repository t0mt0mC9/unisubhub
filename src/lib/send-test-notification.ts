import { supabase } from "@/integrations/supabase/client";

export const sendTestNotificationToTom = async () => {
  console.log('🧪 Envoi de notification test à tom.lifert@gmail.com');
  
  try {
    const { data, error } = await supabase.functions.invoke('test-notification', {
      body: {}
    });

    if (error) {
      console.error('❌ Erreur lors de l\'envoi:', error);
      return { success: false, error };
    }

    console.log('✅ Notification envoyée avec succès:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return { success: false, error };
  }
};

// Exposer la fonction globalement pour test
if (typeof window !== 'undefined') {
  (window as any).sendTestNotificationToTom = sendTestNotificationToTom;
}