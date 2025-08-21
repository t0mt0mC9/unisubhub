export const cleanupAuthState = () => {
  console.log('🧹 Nettoyage complet de l\'état d\'authentification...');
  
  // Supprimer toutes les clés d'auth Supabase du localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log(`🗑️ Suppression de localStorage: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  // Supprimer du sessionStorage si utilisé
  try {
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        console.log(`🗑️ Suppression de sessionStorage: ${key}`);
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    // sessionStorage peut ne pas être disponible
    console.log('⚠️ sessionStorage non disponible');
  }
  
  console.log('✅ Nettoyage d\'authentification terminé');
};