import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c6cdb938779042f1abd39729bbdbc721',
  appName: 'UniSubHub',
  webDir: 'dist',
  server: {
    url: 'https://c6cdb938-7790-42f1-abd3-9729bbdbc721.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1625',
      showSpinner: false
    }
  }
};

export default config;