import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SignInWithApple } from "@capacitor-community/apple-sign-in";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { Eye, EyeOff, KeyRound, Loader2, LogIn, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isMacOS = () => {
    const platform = navigator.platform.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();

    return platform.includes("mac") || userAgent.includes("mac");
  };

  const isAppleSignInAvailable = () => {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios") {
      return true;
    }

    if (!Capacitor.isNativePlatform() && isMacOS()) {
      return true;
    }

    return false;
  };

  // Vérifier les paramètres URL pour le reset de mot de passe (hash et query)
  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const type = searchParams.get("type");
    const error = searchParams.get("error");

    console.log("Paramètres URL:", {
      accessToken,
      refreshToken,
      type,
    });

    // Gérer les erreurs d'abord
    if (error) {
      if (error === "expired") {
        toast({
          title: "Lien expiré",
          description:
            "Le lien de réinitialisation a expiré. Veuillez en demander un nouveau.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de l'authentification.",
          variant: "destructive",
        });
      }
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (type === "recovery" && accessToken && refreshToken) {
      // L'utilisateur a cliqué sur le lien de reset
      setIsResettingPassword(true);
      setActiveTab("reset");

      sessionStorage.setItem("reset_access_token", accessToken);
      sessionStorage.setItem("reset_refresh_token", refreshToken);
    }
  }, [searchParams, toast]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté à UniSubHub",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez saisir votre nom complet",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        // Handle specific case where user already exists
        if (error.message === "User already registered") {
          toast({
            title: "Compte existant détecté",
            description:
              "Un compte existe déjà avec cet email. Essayez de vous connecter ou réinitialiser votre mot de passe.",
            variant: "destructive",
          });
          // Automatically switch to sign in tab
          setActiveTab("signin");
          setLoading(false);
          return;
        }
        throw error;
      }

      // Send our custom UniSubHub welcome email (informational only)
      if (data.user) {
        try {
          // Create a welcome/information link that redirects to the app
          const welcomeUrl = `${
            window.location.origin
          }/?welcome=true&email=${encodeURIComponent(email)}`;

          const { error: emailError } = await supabase.functions.invoke(
            "send-confirmation-email",
            {
              body: {
                email: email,
                confirmation_link: welcomeUrl,
              },
            }
          );

          if (emailError) {
            console.error(
              "❌ Error sending UniSubHub welcome email:",
              emailError
            );
          } else {
            console.log("✅ Email de bienvenue UniSubHub envoyé avec succès!");
          }
        } catch (emailError) {
          console.error("❌ Exception sending welcome email:", emailError);
        }
      }

      toast({
        title: "Inscription réussie",
        description:
          "Un email de confirmation aux couleurs UniSubHub vous a été envoyé automatiquement ! Vérifiez votre boîte mail (et vos spams).",
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      if (Capacitor.isNativePlatform()) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: "unisubhub://oauth-callback",
            skipBrowserRedirect: true,
          },
        });

        if (error) throw error;
        await Browser.open({ url: data.url });

        // Écouter le retour de l'app
        return new Promise((resolve, reject) => {
          App.addListener("appUrlOpen", async (data) => {
            if (data.url.includes("oauth-callback")) {
              await Browser.close();

              const url = new URL(data.url);
              const code = url.searchParams.get("code");

              if (code) {
                const { error, data: sessionData } =
                  await supabase.auth.exchangeCodeForSession(code);

                if (error) {
                  console.error("exchangeCodeForSession", error);
                  reject(error);
                  return;
                }

                resolve(sessionData);
              } else if (data.url.includes("#")) {
                const params = new URLSearchParams(data.url.split("#")[1]);
                const access_token = params.get("access_token");
                const refresh_token = params.get("refresh_token");

                if (access_token && refresh_token) {
                  const { data: sessionData, error: sessionError } =
                    await supabase.auth.setSession({
                      access_token,
                      refresh_token,
                    });
                  if (sessionError) {
                    console.error("setSession", sessionError);
                    reject(sessionError);
                  } else {
                    resolve(sessionData);
                  }
                } else {
                  reject(new Error("Tokens manquants dans l'URL de callback"));
                }
              }
            }
          });
        });
      } else {
        // Pour web : méthode normale
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
        });

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error("Erreur Google Sign-In:", error);
      toast({
        title: "Erreur de connexion Google",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await SignInWithApple.authorize({
          clientId: "com.unisubhub.mobile",
          scopes: "email name",
          redirectURI:
            "https://rhmxohcqyyyglgmtnioc.supabase.co/auth/v1/callback",
        });

        console.log("Apple Sign-In result:", result);

        if (result.response?.identityToken) {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: "apple",
            token: result.response.identityToken,
          });
          if (error) {
            console.error("Erreur Supabase:", error);
            throw error;
          }

          console.log("Connexion réussie:", data);

          toast({
            title: "Connexion Apple réussie",
            description: "Vous êtes maintenant connecté",
          });
        }
      } else {
        const result = await supabase.auth.signInWithOAuth({
          provider: "apple",
          options: {
            redirectTo: `${window.location.origin}/auth?provider=apple`,
          },
        });

        console.log("Apple OAuth redirect URL:", result);
      }
    } catch (error: any) {
      toast({
        title: "Erreur de connexion Apple",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (data.session && searchParams.get("provider") === "apple") {
        console.log("✅ Session Apple OAuth récupérée:", data.session);

        toast({
          title: "Connexion Apple réussie",
          description: `Bienvenue ${
            data.session.user?.user_metadata?.full_name ||
            data.session.user?.email
          }`,
        });

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        navigate("/");
      } else if (error) {
        console.error("❌ Erreur session OAuth Apple:", error);
        toast({
          title: "Erreur de connexion Apple",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    if (searchParams.get("provider") === "apple") {
      handleOAuthCallback();
    }
  }, [searchParams, navigate, toast]);

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email requis",
        description:
          "Veuillez saisir votre adresse email pour réinitialiser votre mot de passe.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: Capacitor.isNativePlatform
          ? "unisubhub://auth"
          : `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Email envoyé",
        description:
          "Un lien de réinitialisation a été envoyé à votre adresse email.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const accessToken = sessionStorage.getItem("reset_access_token");
      const refreshToken = sessionStorage.getItem("reset_refresh_token");

      if (!accessToken || !refreshToken) {
        throw new Error("Tokens de réinitialisation manquants");
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) throw sessionError;

      // Changer le mot de passe
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      sessionStorage.removeItem("reset_access_token");
      sessionStorage.removeItem("reset_refresh_token");

      toast({
        title: "Mot de passe mis à jour",
        description:
          "Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.",
      });

      // Rediriger vers la page de connexion
      setIsResettingPassword(false);
      setActiveTab("signin");
      setNewPassword("");
      setConfirmPassword("");
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">UniSubHub</h1>
          <p className="text-muted-foreground">
            Gérez tous vos abonnements en un seul endroit
          </p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isResettingPassword
                ? "Réinitialiser le mot de passe"
                : "Accéder à votre compte"}
            </CardTitle>
            <CardDescription className="text-center">
              {isResettingPassword
                ? "Définissez votre nouveau mot de passe"
                : "Connectez-vous ou créez un nouveau compte"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isResettingPassword ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={loading}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    Confirmer le nouveau mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <KeyRound className="mr-2 h-4 w-4" />
                  Mettre à jour le mot de passe
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsResettingPassword(false);
                    setActiveTab("signin");
                    window.history.replaceState(
                      {},
                      document.title,
                      window.location.pathname
                    );
                  }}
                  disabled={loading}
                >
                  Retour à la connexion
                </Button>
              </form>
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="signin"
                    className="flex items-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Connexion
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Inscription
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full"
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Google
                      </Button>

                      {isAppleSignInAvailable() && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAppleSignIn}
                          disabled={loading}
                          className="w-full"
                        >
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                            />
                          </svg>
                          Apple
                        </Button>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Ou continuer avec
                        </span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="votre.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-sm text-muted-foreground hover:text-primary"
                        onClick={handleForgotPassword}
                        disabled={loading}
                      >
                        Mot de passe oublié ?
                      </Button>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Se connecter
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full"
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Google
                      </Button>

                      {isAppleSignInAvailable() && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAppleSignIn}
                          disabled={loading}
                          className="w-full"
                        >
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                            />
                          </svg>
                          Apple
                        </Button>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Ou continuer avec
                        </span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-fullname">Nom complet *</Label>
                      <Input
                        id="signup-fullname"
                        type="text"
                        placeholder="Jean Dupont"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="votre.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                          minLength={6}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Créer un compte
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
