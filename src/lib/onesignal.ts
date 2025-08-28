// OneSignal configuration and initialization
import { Capacitor } from '@capacitor/core';

declare global {
  interface Window {
    OneSignal?: any;
  }
}

export const initializeOneSignal = () => {
  if (Capacitor.isNativePlatform()) {
    // Configuration mobile native
    initMobileOneSignal();
  } else {
    // Configuration web
    initWebOneSignal();
  }
};

const initMobileOneSignal = async () => {
  try {
    // Configuration mobile via web SDK pour compatibilité
    console.log('📱 Configuration OneSignal mobile via web SDK');
    initWebOneSignal();
    
    // Associer l'utilisateur avec son email pour le ciblage mobile
    setTimeout(() => {
      const userEmail = localStorage.getItem('supabase_user_email') || 'tom.lifert@gmail.com';
      
      if (window.OneSignal && userEmail) {
        window.OneSignal.push(() => {
          // Taguer l'utilisateur avec son email pour le ciblage
          window.OneSignal.setEmail(userEmail);
          console.log('📱 OneSignal mobile configuré pour:', userEmail);
        });
      }
    }, 3000);

  } catch (error) {
    console.error('❌ Erreur configuration OneSignal mobile:', error);
  }
};

const initWebOneSignal = () => {
  // Load OneSignal script
  const script = document.createElement('script');
  script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
  script.async = true;
  document.head.appendChild(script);

  script.onload = () => {
    if (window.OneSignal) {
      window.OneSignal.push(() => {
        window.OneSignal.init({
          appId: "e1e3a34f-c681-49ec-9c03-51c04792d448",
          notifyButton: {
            enable: true,
          },
          allowLocalhostAsSecureOrigin: true,
        });

        // Configurer l'email pour le ciblage
        const userEmail = localStorage.getItem('supabase_user_email') || 'tom.lifert@gmail.com';
        if (userEmail) {
          window.OneSignal.setEmail(userEmail);
          console.log('🌐 OneSignal web configuré avec email:', userEmail);
        }

        // Log when user subscribes
        window.OneSignal.on('subscriptionChange', (isSubscribed: boolean) => {
          console.log("OneSignal subscription state changed:", isSubscribed);
          if (isSubscribed) {
            // Get the user ID and save it
            window.OneSignal.getUserId().then((userId: string) => {
              console.log("OneSignal User ID:", userId);
              localStorage.setItem('onesignal_user_id', userId);
              
              // Associer l'email pour le ciblage
              const userEmail = localStorage.getItem('supabase_user_email') || 'tom.lifert@gmail.com';
              window.OneSignal.setEmail(userEmail);
            });
          }
        });

        // Check if user is already subscribed
        window.OneSignal.isPushNotificationsEnabled().then((isEnabled: boolean) => {
          if (isEnabled) {
            window.OneSignal.getUserId().then((userId: string) => {
              console.log("OneSignal User ID (already subscribed):", userId);
              localStorage.setItem('onesignal_user_id', userId);
              
              // Associer l'email pour le ciblage
              const userEmail = localStorage.getItem('supabase_user_email') || 'tom.lifert@gmail.com';
              window.OneSignal.setEmail(userEmail);
            });
          }
        });
      });
    }
  };
};

export const requestNotificationPermission = () => {
  if (window.OneSignal) {
    window.OneSignal.showNativePrompt();
  }
};

export const getOneSignalUserId = (): Promise<string | null> => {
  return new Promise((resolve) => {
    if (window.OneSignal) {
      window.OneSignal.getUserId().then((userId: string) => {
        resolve(userId);
      }).catch(() => {
        resolve(null);
      });
    } else {
      resolve(null);
    }
  });
};