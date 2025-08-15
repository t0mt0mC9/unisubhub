import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Loader2, Gift } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, []);

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

      navigate('/');
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
    setLoading(true);

    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        // Handle specific case where user already exists
        if (error.message === "User already registered") {
          toast({
            title: "Compte existant détecté",
            description: "Un compte existe déjà avec cet email. Essayez de vous connecter ou réinitialiser votre mot de passe.",
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
          const welcomeUrl = `${window.location.origin}/?welcome=true&email=${encodeURIComponent(email)}`;
          
          const { error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
            body: {
              email: email,
              confirmation_link: welcomeUrl
            }
          });

          if (emailError) {
            console.error('❌ Error sending UniSubHub welcome email:', emailError);
          } else {
            console.log('✅ Email de bienvenue UniSubHub envoyé avec succès!');
          }
        } catch (emailError) {
          console.error('❌ Exception sending welcome email:', emailError);
        }
      }

      // If there's a referral code, record the referral after successful signup
      if (referralCode && data.user) {
        try {
          const { error: referralError } = await supabase
            .from('referrals')
            .update({ 
              referred_user_id: data.user.id,
              status: 'completed'
            })
            .eq('referral_code', referralCode)
            .eq('status', 'pending');

          if (referralError) {
            console.error('Error updating referral:', referralError);
          } else {
            toast({
              title: "Parrainage enregistré !",
              description: "Votre compte a été lié au parrainage avec succès",
            });
          }
        } catch (referralError) {
          console.error('Error processing referral:', referralError);
        }
      }

      toast({
        title: "Inscription réussie",
        description: "Un email de confirmation aux couleurs UniSubHub vous a été envoyé automatiquement ! Vérifiez votre boîte mail (et vos spams).",
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

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir votre adresse email pour réinitialiser votre mot de passe.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Email envoyé",
        description: "Un lien de réinitialisation a été envoyé à votre adresse email.",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">UniSubHub</h1>
          <p className="text-muted-foreground">Gérez tous vos abonnements en un seul endroit</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Accéder à votre compte</CardTitle>
            <CardDescription className="text-center">
              Connectez-vous ou créez un nouveau compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Connexion
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Inscription
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4 mt-6">
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
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
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
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Se connecter
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
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
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referral-code" className="flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      Code de parrainage (optionnel)
                    </Label>
                    <Input
                      id="referral-code"
                      type="text"
                      placeholder="Entrez votre code de parrainage"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      disabled={loading}
                    />
                    {referralCode && (
                      <p className="text-sm text-muted-foreground">
                        🎉 Code de parrainage détecté ! Vous bénéficierez des avantages du parrainage.
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Créer un compte
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;