// OneSignal configuration and initialization
declare global {
  interface Window {
    OneSignal?: any;
  }
}

export const initializeOneSignal = () => {
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

        // Log when user subscribes
        window.OneSignal.on('subscriptionChange', (isSubscribed: boolean) => {
          console.log("OneSignal subscription state changed:", isSubscribed);
          if (isSubscribed) {
            // Get the user ID and save it
            window.OneSignal.getUserId().then((userId: string) => {
              console.log("OneSignal User ID:", userId);
              localStorage.setItem('onesignal_user_id', userId);
            });
          }
        });

        // Check if user is already subscribed
        window.OneSignal.isPushNotificationsEnabled().then((isEnabled: boolean) => {
          if (isEnabled) {
            window.OneSignal.getUserId().then((userId: string) => {
              console.log("OneSignal User ID (already subscribed):", userId);
              localStorage.setItem('onesignal_user_id', userId);
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