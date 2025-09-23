import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.unisubhub.app',
  appName: 'UniSubHub',
  webDir: 'dist',
  // server: {
  //   url: 'https://c6cdb938-7790-42f1-abd3-9729bbdbc721.lovableproject.com?forceHideBadge=true',
  //  cleartext: true
  // },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1625',
      showSpinner: false
    },
    PurchasesCapacitor: {
      // Configuration pour RevenueCat
    },
    // Configuration OneSignal pour mobile
    OneSignal: {
      appId: "e1e3a34f-c681-49ec-9c03-51c04792d448",
    },
    App: {
      handleUrl: true,
    },
  },
};

export default config;
