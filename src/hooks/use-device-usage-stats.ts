import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

// Import du plugin Android pour les stats d'usage
declare global {
  interface Window {
    AndroidUsageStatsManager?: {
      getUsageStats: (options: { 
        interval: number; 
        startTime: number; 
        endTime: number; 
      }) => Promise<{ usageStats: AppUsageStats[] }>;
      requestUsageStatsPermission: () => Promise<{ granted: boolean }>;
      hasUsageStatsPermission: () => Promise<{ granted: boolean }>;
    };
  }
}

export interface AppUsageStats {
  packageName: string;
  appName: string;
  totalTimeInForeground: number; // en millisecondes
  lastTimeUsed: number; // timestamp
  firstTimeStamp: number; // timestamp
  lastTimeStamp: number; // timestamp
  totalTimeVisible: number; // en millisecondes
}

export interface DeviceUsageData {
  apps: AppUsageStats[];
  totalScreenTime: number; // en minutes
  mostUsedApp: AppUsageStats | null;
  categories: { [category: string]: number }; // temps par catégorie en minutes
  insights: string[]; // recommandations basées sur l'usage
}

// Mapping des packages vers les catégories
const APP_CATEGORIES: { [packageName: string]: string } = {
  // Réseaux sociaux
  'com.facebook.katana': 'Réseaux sociaux',
  'com.instagram.android': 'Réseaux sociaux',
  'com.twitter.android': 'Réseaux sociaux',
  'com.snapchat.android': 'Réseaux sociaux',
  'com.linkedin.android': 'Réseaux sociaux',
  'com.zhiliaoapp.musically': 'Réseaux sociaux', // TikTok
  
  // Divertissement
  'com.netflix.mediaclient': 'Divertissement',
  'com.disney.disneyplus': 'Divertissement',
  'com.amazon.avod.thirdpartyclient': 'Divertissement', // Prime Video
  'com.spotify.music': 'Divertissement',
  'com.google.android.youtube': 'Divertissement',
  'com.deezer.android.app': 'Divertissement',
  
  // Jeux
  'com.supercell.clashofclans': 'Jeux',
  'com.king.candycrushsaga': 'Jeux',
  'com.mojang.minecraftpe': 'Jeux',
  'com.roblox.client': 'Jeux',
  
  // Productivité
  'com.microsoft.office.outlook': 'Productivité',
  'com.google.android.gm': 'Productivité', // Gmail
  'com.slack': 'Productivité',
  'com.microsoft.teams': 'Productivité',
  'com.notion.id': 'Productivité',
  'com.todoist': 'Productivité',
  
  // E-commerce
  'com.amazon.mShop.android.shopping': 'Shopping',
  'com.ebay.mobile': 'Shopping',
  'com.zalando.android': 'Shopping',
  
  // Communication
  'com.whatsapp': 'Communication',
  'org.telegram.messenger': 'Communication',
  'com.discord': 'Communication',
  'com.viber.voip': 'Communication',
  
  // Navigation
  'com.google.android.apps.maps': 'Navigation',
  'com.waze': 'Navigation',
  
  // Finance
  'com.paypal.android.p2pmobile': 'Finance',
  'com.revolut.revolut': 'Finance',
  'com.boursorama.android.clients': 'Finance',
  'fr.creditagricole.androidapp': 'Finance',
  
  // Santé et Fitness
  'com.nike.ntc': 'Santé & Fitness',
  'com.myfitnesspal.android': 'Santé & Fitness',
  'com.strava': 'Santé & Fitness',
  'com.headspace.android': 'Santé & Fitness',
};

// Noms d'applications plus lisibles
const APP_DISPLAY_NAMES: { [packageName: string]: string } = {
  'com.facebook.katana': 'Facebook',
  'com.instagram.android': 'Instagram',
  'com.twitter.android': 'Twitter/X',
  'com.snapchat.android': 'Snapchat',
  'com.zhiliaoapp.musically': 'TikTok',
  'com.netflix.mediaclient': 'Netflix',
  'com.spotify.music': 'Spotify',
  'com.google.android.youtube': 'YouTube',
  'com.whatsapp': 'WhatsApp',
  'com.google.android.gm': 'Gmail',
  'com.google.android.apps.maps': 'Google Maps',
  // Ajoutez d'autres mappings selon vos besoins
};

export const useDeviceUsageStats = () => {
  const [usageData, setUsageData] = useState<DeviceUsageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string>('');

  // Vérifier les permissions au démarrage
  useEffect(() => {
    checkPermissions();
    getPlatform();
  }, []);

  const getPlatform = async () => {
    const deviceInfo = await Device.getInfo();
    setPlatform(deviceInfo.platform);
  };

  const checkPermissions = async () => {
    if (Capacitor.getPlatform() === 'android') {
      try {
        if (window.AndroidUsageStatsManager) {
          const result = await window.AndroidUsageStatsManager.hasUsageStatsPermission();
          setHasPermission(result.granted);
        }
      } catch (err) {
        console.error('Erreur lors de la vérification des permissions:', err);
        setError('Impossible de vérifier les permissions');
      }
    } else if (Capacitor.getPlatform() === 'ios') {
      // Pour iOS, nous ne pouvons pas vérifier automatiquement les permissions Screen Time
      // L'utilisateur doit les accorder manuellement dans les réglages
      setHasPermission(false);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (Capacitor.getPlatform() === 'android') {
        if (window.AndroidUsageStatsManager) {
          const result = await window.AndroidUsageStatsManager.requestUsageStatsPermission();
          setHasPermission(result.granted);
          return result.granted;
        } else {
          throw new Error('Plugin Android UsageStats non disponible');
        }
      } else if (Capacitor.getPlatform() === 'ios') {
        // Pour iOS, rediriger vers les réglages
        setError('Veuillez activer les permissions Screen Time dans Réglages > Confidentialité et sécurité > Statistiques d\'apps');
        return false;
      } else {
        setError('Plateforme non supportée pour les statistiques d\'usage d\'apps');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la demande de permissions');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getAppCategory = (packageName: string): string => {
    return APP_CATEGORIES[packageName] || 'Autres';
  };

  const getAppDisplayName = (packageName: string, originalName: string): string => {
    return APP_DISPLAY_NAMES[packageName] || originalName || packageName;
  };

  const generateInsights = (apps: AppUsageStats[], totalTime: number): string[] => {
    const insights: string[] = [];
    
    // Analyse du temps total
    if (totalTime > 480) { // Plus de 8 heures
      insights.push('⚠️ Temps d\'écran très élevé (>8h). Essayez de définir des limites quotidiennes.');
    } else if (totalTime > 240) { // Plus de 4 heures
      insights.push('📱 Temps d\'écran modérément élevé. Pensez à faire des pauses régulières.');
    } else {
      insights.push('✅ Temps d\'écran dans une fourchette raisonnable.');
    }

    // Analyse de l'app la plus utilisée
    if (apps.length > 0) {
      const mostUsed = apps[0];
      const mostUsedTime = Math.floor(mostUsed.totalTimeInForeground / (1000 * 60));
      const percentage = ((mostUsedTime / totalTime) * 100).toFixed(0);
      
      if (mostUsedTime > 120) { // Plus de 2 heures sur une app
        insights.push(`🎯 ${getAppDisplayName(mostUsed.packageName, mostUsed.appName)} représente ${percentage}% de votre temps (${mostUsedTime}min). Envisagez de diversifier vos activités.`);
      }
    }

    // Analyse des réseaux sociaux
    const socialMediaTime = apps
      .filter(app => getAppCategory(app.packageName) === 'Réseaux sociaux')
      .reduce((total, app) => total + Math.floor(app.totalTimeInForeground / (1000 * 60)), 0);
    
    if (socialMediaTime > 120) {
      insights.push(`📲 ${socialMediaTime}min passées sur les réseaux sociaux. Essayez de limiter ces apps pendant certaines heures.`);
    }

    // Analyse de la productivité
    const productivityTime = apps
      .filter(app => getAppCategory(app.packageName) === 'Productivité')
      .reduce((total, app) => total + Math.floor(app.totalTimeInForeground / (1000 * 60)), 0);
    
    if (productivityTime > socialMediaTime) {
      insights.push(`💼 Bon équilibre : plus de temps sur les apps productives (${productivityTime}min) que sur les réseaux sociaux.`);
    }

    return insights;
  };

  // Données simulées pour démonstration (iPhone)
  const generateSimulatedData = (): DeviceUsageData => {
    const simulatedApps: AppUsageStats[] = [
      {
        packageName: 'com.netflix.Netflix',
        appName: 'Netflix',
        totalTimeInForeground: 7200000, // 2 heures
        lastTimeUsed: Date.now() - 3600000, // Il y a 1 heure
        firstTimeStamp: Date.now() - 86400000 * 7, // Il y a 7 jours
        lastTimeStamp: Date.now() - 3600000,
        totalTimeVisible: 7200000
      },
      {
        packageName: 'com.amazon.aiv.dvr',
        appName: 'Prime Video',
        totalTimeInForeground: 5400000, // 1h30
        lastTimeUsed: Date.now() - 7200000, // Il y a 2 heures
        firstTimeStamp: Date.now() - 86400000 * 7,
        lastTimeStamp: Date.now() - 7200000,
        totalTimeVisible: 5400000
      },
      {
        packageName: 'fr.lequipe.lequipeapp',
        appName: 'L\'Equipe',
        totalTimeInForeground: 2700000, // 45 minutes
        lastTimeUsed: Date.now() - 1800000, // Il y a 30 minutes
        firstTimeStamp: Date.now() - 86400000 * 7,
        lastTimeStamp: Date.now() - 1800000,
        totalTimeVisible: 2700000
      },
      {
        packageName: 'com.instagram.ios',
        appName: 'Instagram',
        totalTimeInForeground: 3600000, // 1 heure
        lastTimeUsed: Date.now() - 900000, // Il y a 15 minutes
        firstTimeStamp: Date.now() - 86400000 * 7,
        lastTimeStamp: Date.now() - 900000,
        totalTimeVisible: 3600000
      },
      {
        packageName: 'com.spotify.client',
        appName: 'Spotify',
        totalTimeInForeground: 4800000, // 1h20
        lastTimeUsed: Date.now() - 600000, // Il y a 10 minutes
        firstTimeStamp: Date.now() - 86400000 * 7,
        lastTimeStamp: Date.now() - 600000,
        totalTimeVisible: 4800000
      },
      {
        packageName: 'com.apple.mobilemail',
        appName: 'Mail',
        totalTimeInForeground: 1800000, // 30 minutes
        lastTimeUsed: Date.now() - 1200000, // Il y a 20 minutes
        firstTimeStamp: Date.now() - 86400000 * 7,
        lastTimeStamp: Date.now() - 1200000,
        totalTimeVisible: 1800000
      },
      {
        packageName: 'com.apple.mobilesafari',
        appName: 'Safari',
        totalTimeInForeground: 3000000, // 50 minutes
        lastTimeUsed: Date.now() - 2400000, // Il y a 40 minutes
        firstTimeStamp: Date.now() - 86400000 * 7,
        lastTimeStamp: Date.now() - 2400000,
        totalTimeVisible: 3000000
      },
      {
        packageName: 'com.apple.mobilephone',
        appName: 'Téléphone',
        totalTimeInForeground: 900000, // 15 minutes
        lastTimeUsed: Date.now() - 3600000, // Il y a 1 heure
        firstTimeStamp: Date.now() - 86400000 * 7,
        lastTimeStamp: Date.now() - 3600000,
        totalTimeVisible: 900000
      }
    ];

    // Trier par temps d'utilisation
    const sortedApps = simulatedApps.sort((a, b) => b.totalTimeInForeground - a.totalTimeInForeground);

    // Calculer le temps total en minutes
    const totalScreenTime = Math.floor(
      sortedApps.reduce((total, app) => total + app.totalTimeInForeground, 0) / (1000 * 60)
    );

    // Catégories simulées
    const categories = {
      'Divertissement': 215, // Netflix + Prime Video + Spotify
      'Réseaux sociaux': 60, // Instagram
      'Actualités': 45, // L'Equipe
      'Navigation': 50, // Safari
      'Productivité': 30, // Mail
      'Communication': 15 // Téléphone
    };

    // Insights personnalisés pour ces données
    const insights = [
      '📺 Vous passez beaucoup de temps sur les plateformes de streaming (3h35). Parfait pour se détendre !',
      '🏃‍♂️ L\'Equipe occupe 45min de votre temps - vous êtes bien informé sur le sport !',
      '📱 Temps d\'écran modéré pour les réseaux sociaux (1h). Bon équilibre !',
      '💡 Conseil : Essayez de programmer vos sessions Netflix pour éviter le "binge watching" excessif.',
      '⚽ Votre passion pour le sport transparaît dans votre usage de L\'Equipe !'
    ];

    return {
      apps: sortedApps,
      totalScreenTime,
      mostUsedApp: sortedApps[0],
      categories,
      insights
    };
  };

  const fetchUsageStats = async (days: number = 7): Promise<DeviceUsageData | null> => {
    if (!hasPermission) {
      setError('Permissions non accordées. Veuillez d\'abord accorder les permissions.');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      if (Capacitor.getPlatform() === 'android') {
        if (!window.AndroidUsageStatsManager) {
          throw new Error('Plugin Android UsageStats non disponible');
        }

        const endTime = Date.now();
        const startTime = endTime - (days * 24 * 60 * 60 * 1000); // X jours en arrière

        const result = await window.AndroidUsageStatsManager.getUsageStats({
          interval: 4, // INTERVAL_DAILY
          startTime,
          endTime
        });

        if (!result.usageStats || result.usageStats.length === 0) {
          setError('Aucune donnée d\'usage trouvée. Assurez-vous que l\'app a l\'autorisation d\'accéder aux statistiques d\'usage.');
          return null;
        }

        // Filtrer et trier les apps par temps d'utilisation
        const filteredApps = result.usageStats
          .filter(app => app.totalTimeInForeground > 60000) // Au moins 1 minute
          .sort((a, b) => b.totalTimeInForeground - a.totalTimeInForeground);

        // Ajouter les noms d'affichage
        const appsWithDisplayNames = filteredApps.map(app => ({
          ...app,
          appName: getAppDisplayName(app.packageName, app.appName)
        }));

        // Calculer le temps total en minutes
        const totalScreenTime = Math.floor(
          filteredApps.reduce((total, app) => total + app.totalTimeInForeground, 0) / (1000 * 60)
        );

        // Grouper par catégories
        const categories: { [category: string]: number } = {};
        filteredApps.forEach(app => {
          const category = getAppCategory(app.packageName);
          const timeInMinutes = Math.floor(app.totalTimeInForeground / (1000 * 60));
          categories[category] = (categories[category] || 0) + timeInMinutes;
        });

        // Générer les insights
        const insights = generateInsights(filteredApps, totalScreenTime);

        const usageData: DeviceUsageData = {
          apps: appsWithDisplayNames,
          totalScreenTime,
          mostUsedApp: appsWithDisplayNames[0] || null,
          categories,
          insights
        };

        setUsageData(usageData);
        return usageData;

      } else {
        setError('iOS Screen Time API nécessite une configuration spéciale et l\'approbation d\'Apple. Fonctionnalité bientôt disponible.');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      console.error('Erreur fetchUsageStats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Utiliser les données simulées
  const useSimulatedData = () => {
    const simulatedData = generateSimulatedData();
    setUsageData(simulatedData);
    setHasPermission(true);
    setError(null);
  };

  const clearData = () => {
    setUsageData(null);
    setError(null);
  };

  return {
    usageData,
    loading,
    hasPermission,
    error,
    platform,
    requestPermissions,
    fetchUsageStats,
    clearData,
    checkPermissions,
    generateSimulatedData,
    useSimulatedData
  };
};