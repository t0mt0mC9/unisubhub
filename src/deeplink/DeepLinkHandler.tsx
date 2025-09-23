import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { App as CapApp, URLOpenListenerEvent } from "@capacitor/app";

function parseSupabaseParams(url: string) {
  const u = new URL(url);
  const hash = u.hash.startsWith("#") ? u.hash.slice(1) : "";
  const p = new URLSearchParams(hash || u.search);
  return {
    type: p.get("type"),
    access_token: p.get("access_token"),
    refresh_token: p.get("refresh_token"),
    error: p.get("error"),
    error_code: p.get("error_code"),
    error_description: p.get("error_description"),
  };
}

export default function DeepLinkHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("DeepLinkHandler mounted");
    const onOpen = async ({ url }: URLOpenListenerEvent) => {
      console.log("App opened with URL:", url);
      if (!url.startsWith("unisubhub.dev://auth")) return;
      console.log("Handling deep link for auth:", url);
      const {
        type,
        access_token,
        refresh_token,
        error,
        error_code,
        error_description,
      } = parseSupabaseParams(url);

      // Gérer les erreurs
      if (error) {
        console.error("Deep link error:", {
          error,
          error_code,
          error_description,
        });
        navigate(`/auth?error=${error}&error_code=${error_code}`, {
          replace: true,
        });
        return;
      }
      if (type === "recovery" && access_token && refresh_token) {
        console.log(
          "Password recovery link detected, navigating to auth with tokens"
        );
        navigate(
          `/auth?type=recovery&access_token=${access_token}&refresh_token=${refresh_token}`,
          { replace: true }
        );
        console.log("Navigated to /auth for password recovery");
      }
    };

    // 1) App déjà ouverte
    const subPromise = CapApp.addListener("appUrlOpen", onOpen);
    // 2) Cold start (l’app lancée par le lien)
    CapApp.getLaunchUrl().then(
      (l) => l?.url && onOpen({ url: l.url } as URLOpenListenerEvent)
    );

    console.log("DeepLinkHandler initialized");

    return () => {
      subPromise.then((s) => s.remove());
    };
  }, [navigate]);

  return null;
}
