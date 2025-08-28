// Test direct de notification OneSignal
declare global {
  interface Window {
    testOneSignalNotification?: () => Promise<any>;
    checkOneSignalConfiguration?: () => Promise<any>;
  }
}

export const sendTestNotification = async () => {
  console.log('🧪 Début du test de notification OneSignal');
  
  try {
    const response = await fetch('https://rhmxohcqyyyglgmtnioc.supabase.co/functions/v1/test-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJobXhvaGNxeXl5Z2xnbXRuaW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDgxODYsImV4cCI6MjA2OTQ4NDE4Nn0.eD2IZcW4WI-rR1NVC2CRe1_kX3bBVGb3j-HTti2c2-4'
      },
      body: JSON.stringify({})
    });

    console.log('📡 Statut de la réponse:', response.status);
    
    const result = await response.json();
    console.log('📋 Résultat:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return { error: error.message };
  }
};

// Vérifier la configuration OneSignal
export const checkOneSignalConfig = async () => {
  console.log('🔍 Vérification de la configuration OneSignal');
  
  try {
    const response = await fetch('https://rhmxohcqyyyglgmtnioc.supabase.co/functions/v1/check-onesignal-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJobXhvaGNxeXl5Z2xnbXRuaW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDgxODYsImV4cCI6MjA2OTQ4NDE4Nn0.eD2IZcW4WI-rR1NVC2CRe1_kX3bBVGb3j-HTti2c2-4'
      }
    });

    const result = await response.json();
    console.log('⚙️ Configuration OneSignal:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    return { error: error.message };
  }
};

// Auto-lancer les tests
if (typeof window !== 'undefined') {
  window.testOneSignalNotification = sendTestNotification;
  window.checkOneSignalConfiguration = checkOneSignalConfig;
  
  // Démarrer les tests automatiquement
  setTimeout(() => {
    console.log('🚀 Démarrage automatique des tests OneSignal');
    checkOneSignalConfig().then(() => sendTestNotification());
  }, 2000);
}