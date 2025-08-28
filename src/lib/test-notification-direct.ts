// Test direct OneSignal depuis le frontend
export const testOneSignalDirectFromFrontend = async () => {
  console.log('🧪 Test direct OneSignal depuis le frontend');
  
  try {
    // Configuration OneSignal (temporaire pour test)
    const oneSignalConfig = {
      appId: 'e1e3a34f-c681-49ec-9c03-51c04792d448',
      // Note: Pour un vrai test, vous devez fournir votre REST API Key OneSignal
    };

    // Test via OneSignal Web SDK
    if (window.OneSignal) {
      console.log('📱 Utilisation du SDK OneSignal web');
      
      // Vérifier si l'utilisateur est abonné
      const isSubscribed = await window.OneSignal.isPushNotificationsEnabled();
      console.log('Utilisateur abonné aux notifications:', isSubscribed);
      
      if (!isSubscribed) {
        console.log('🔔 Demande d\'autorisation de notification');
        await window.OneSignal.showNativePrompt();
        return { success: false, message: 'Autorisez d\'abord les notifications' };
      }

      // Obtenir l'ID de l'utilisateur
      const userId = await window.OneSignal.getUserId();
      console.log('OneSignal User ID:', userId);
      
      // Configurer l'email pour le ciblage
      await window.OneSignal.setEmail('tom.lifert@gmail.com');
      console.log('Email configuré pour tom.lifert@gmail.com');
      
      // Envoyer une notification de test locale
      console.log('✅ Configuration OneSignal OK');
      console.log('Pour recevoir une notification, assurez-vous que:');
      console.log('1. Les notifications sont autorisées dans votre navigateur');
      console.log('2. Vous êtes connecté avec tom.lifert@gmail.com');
      console.log('3. L\'onglet n\'est pas en mode focus (fermez cet onglet)');
      
      return { 
        success: true, 
        message: 'Configuration OK - vous devriez recevoir des notifications',
        userId,
        isSubscribed
      };
    } else {
      return { success: false, message: 'OneSignal SDK non chargé' };
    }
    
  } catch (error) {
    console.error('❌ Erreur test OneSignal:', error);
    return { success: false, error: error.message };
  }
};

// Test de notification via service worker
export const testServiceWorkerNotification = async () => {
  console.log('🔔 Test notification via Service Worker');
  
  try {
    // Vérifier le support des notifications
    if (!('Notification' in window)) {
      return { success: false, message: 'Notifications non supportées' };
    }

    // Demander permission
    const permission = await Notification.requestPermission();
    console.log('Permission notification:', permission);
    
    if (permission === 'granted') {
      // Créer notification test
      const notification = new Notification('🧪 Test UniSubHub Mobile', {
        body: 'Bonjour Tom ! Cette notification test fonctionne sur votre mobile ! 📱✅',
        icon: '/logo.png',
        tag: 'test-mobile',
        requireInteraction: true
      });
      
      notification.onclick = () => {
        console.log('Notification cliquée');
        notification.close();
      };
      
      return { success: true, message: 'Notification de test envoyée' };
    } else {
      return { success: false, message: 'Permission refusée' };
    }
    
  } catch (error) {
    console.error('❌ Erreur notification SW:', error);
    return { success: false, error: error.message };
  }
};

// Exposer les fonctions globalement
if (typeof window !== 'undefined') {
  (window as any).testOneSignalDirectFromFrontend = testOneSignalDirectFromFrontend;
  (window as any).testServiceWorkerNotification = testServiceWorkerNotification;
  
  console.log('🎯 Fonctions de test disponibles:');
  console.log('- window.testOneSignalDirectFromFrontend()');
  console.log('- window.testServiceWorkerNotification()');
}