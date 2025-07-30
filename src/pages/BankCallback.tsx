import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const BankCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (window.opener) {
      if (error) {
        // Erreur d'autorisation
        window.opener.postMessage({
          type: 'BANK_AUTH_ERROR',
          error: error
        }, window.location.origin);
      } else if (code && state) {
        // Autorisation réussie
        window.opener.postMessage({
          type: 'BANK_AUTH_SUCCESS',
          code: code,
          state: state
        }, window.location.origin);
      }
      
      // Fermer la popup
      window.close();
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Autorisation en cours...</h2>
        <p className="text-muted-foreground">
          Vous pouvez fermer cette fenêtre.
        </p>
      </div>
    </div>
  );
};