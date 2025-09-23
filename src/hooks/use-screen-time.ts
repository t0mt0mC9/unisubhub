import { useState, useEffect, useRef } from 'react';
import { App, AppState } from '@capacitor/app';
import { Device } from '@capacitor/device';

export interface ScreenTimeData {
  dailyUsage: number; // en minutes
  weeklyUsage: number; // en minutes
  monthlyUsage: number; // en minutes
  sessionDuration: number; // session actuelle en minutes
  averageDailyUsage: number; // moyenne sur 7 jours
  sessionsToday: number;
  lastSessionDate: string;
}

export interface AppUsageSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // en minutes
  date: string; // YYYY-MM-DD
}

const STORAGE_KEY = 'screen_time_data';
const SESSIONS_KEY = 'app_usage_sessions';

export const useScreenTime = () => {
  const [screenTimeData, setScreenTimeData] = useState<ScreenTimeData>({
    dailyUsage: 0,
    weeklyUsage: 0,
    monthlyUsage: 0,
    sessionDuration: 0,
    averageDailyUsage: 0,
    sessionsToday: 0,
    lastSessionDate: new Date().toISOString().split('T')[0]
  });

  const [isTracking, setIsTracking] = useState(false);
  const sessionStartTime = useRef<Date | null>(null);
  const currentSessionId = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Charger les données depuis le localStorage
  const loadStoredData = () => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setScreenTimeData(parsed);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données Screen Time:', error);
    }
  };

  // Sauvegarder les données dans le localStorage
  const saveData = (data: ScreenTimeData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données Screen Time:', error);
    }
  };

  // Obtenir les sessions d'utilisation
  const getSessions = (): AppUsageSession[] => {
    try {
      const sessions = localStorage.getItem(SESSIONS_KEY);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
      return [];
    }
  };

  // Sauvegarder une session
  const saveSession = (session: AppUsageSession) => {
    try {
      const sessions = getSessions();
      const updatedSessions = [...sessions, session];
      
      // Garder seulement les 30 derniers jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const filteredSessions = updatedSessions.filter(s => 
        new Date(s.date) >= thirtyDaysAgo
      );
      
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(filteredSessions));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la session:', error);
    }
  };

  // Calculer les statistiques d'utilisation
  const calculateUsageStats = (): ScreenTimeData => {
    const sessions = getSessions();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Sessions d'aujourd'hui
    const todaySessions = sessions.filter(s => s.date === today);
    const dailyUsage = todaySessions.reduce((total, session) => total + session.duration, 0);
    const sessionsToday = todaySessions.length;

    // Sessions de la semaine (7 derniers jours)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekSessions = sessions.filter(s => new Date(s.date) >= weekAgo);
    const weeklyUsage = weekSessions.reduce((total, session) => total + session.duration, 0);

    // Sessions du mois (30 derniers jours)
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthSessions = sessions.filter(s => new Date(s.date) >= monthAgo);
    const monthlyUsage = monthSessions.reduce((total, session) => total + session.duration, 0);

    // Moyenne quotidienne (7 derniers jours)
    const dailyAverages: { [date: string]: number } = {};
    weekSessions.forEach(session => {
      if (!dailyAverages[session.date]) {
        dailyAverages[session.date] = 0;
      }
      dailyAverages[session.date] += session.duration;
    });
    const averageDailyUsage = Object.keys(dailyAverages).length > 0 
      ? Object.values(dailyAverages).reduce((a, b) => a + b, 0) / Object.keys(dailyAverages).length
      : 0;

    // Durée de la session actuelle
    const sessionDuration = sessionStartTime.current 
      ? Math.floor((now.getTime() - sessionStartTime.current.getTime()) / (1000 * 60))
      : 0;

    return {
      dailyUsage,
      weeklyUsage,
      monthlyUsage,
      sessionDuration,
      averageDailyUsage,
      sessionsToday,
      lastSessionDate: today
    };
  };

  // Démarrer le tracking d'une session
  const startSession = () => {
    if (!sessionStartTime.current) {
      sessionStartTime.current = new Date();
      currentSessionId.current = crypto.randomUUID();
      setIsTracking(true);

      // Mettre à jour les statistiques toutes les minutes
      intervalRef.current = setInterval(() => {
        const newData = calculateUsageStats();
        setScreenTimeData(newData);
        saveData(newData);
      }, 60000); // 60 secondes
    }
  };

  // Terminer le tracking d'une session
  const endSession = () => {
    if (sessionStartTime.current && currentSessionId.current) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - sessionStartTime.current.getTime()) / (1000 * 60));
      
      if (duration > 0) { // Seulement sauvegarder les sessions de plus d'une minute
        const session: AppUsageSession = {
          id: currentSessionId.current,
          startTime: sessionStartTime.current,
          endTime,
          duration,
          date: endTime.toISOString().split('T')[0]
        };
        
        saveSession(session);
      }

      sessionStartTime.current = null;
      currentSessionId.current = null;
      setIsTracking(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Mettre à jour les statistiques finales
      const newData = calculateUsageStats();
      setScreenTimeData(newData);
      saveData(newData);
    }
  };

  // Obtenir les informations de l'appareil
  const getDeviceInfo = async () => {
    try {
      const info = await Device.getInfo();
      return {
        platform: info.platform,
        model: info.model,
        osVersion: info.osVersion,
        manufacturer: info.manufacturer
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des infos de l\'appareil:', error);
      return null;
    }
  };

  // Réinitialiser les données
  const resetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSIONS_KEY);
    setScreenTimeData({
      dailyUsage: 0,
      weeklyUsage: 0,
      monthlyUsage: 0,
      sessionDuration: 0,
      averageDailyUsage: 0,
      sessionsToday: 0,
      lastSessionDate: new Date().toISOString().split('T')[0]
    });
  };

  // Obtenir l'historique des sessions
  const getSessionHistory = (days: number = 7): AppUsageSession[] => {
    const sessions = getSessions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return sessions.filter(s => new Date(s.date) >= cutoffDate);
  };

  // Initialisation et gestion des événements d'état de l'app
  useEffect(() => {
    loadStoredData();

    // Écouter les changements d'état de l'app
    const handleAppStateChange = (state: AppState) => {
      if (state.isActive) {
        startSession();
      } else {
        endSession();
      }
    };

    // Démarrer immédiatement si l'app est active
    startSession();

    // Écouter les événements d'état de l'app
    App.addListener('appStateChange', handleAppStateChange);

    // Gérer la fermeture/refresh de la page web
    const handleBeforeUnload = () => {
      endSession();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        endSession();
      } else {
        startSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      endSession();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      App.removeAllListeners();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    screenTimeData,
    isTracking,
    startSession,
    endSession,
    resetData,
    getDeviceInfo,
    getSessionHistory
  };
};