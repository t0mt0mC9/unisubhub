import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Gift, Users, Mail, Share2, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Referral {
  id: string;
  referred_email: string;
  status: string;
  referral_code: string;
  created_at: string;
  completed_at?: string;
  rewarded_at?: string;
  referred_user_id?: string;
  referrer_user_id: string;
  reward_granted: boolean;
}

export default function ReferralPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [myReferralCode, setMyReferralCode] = useState<string>("");
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    rewarded: 0,
    totalRewards: 0
  });

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReferrals(data || []);
      
      // Calculate stats
      const pending = data?.filter(r => r.status === 'pending').length || 0;
      const completed = data?.filter(r => r.status === 'completed').length || 0;
      const rewarded = data?.filter(r => r.status === 'rewarded').length || 0;
      const totalRewards = Math.floor(rewarded / 2);

      setStats({ pending, completed, rewarded, totalRewards });
    } catch (error) {
      console.error('Error fetching referrals:', error);
      toast.error("Erreur lors du chargement des parrainages");
    }
  };

  const generateReferralCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate a unique code
      const { data, error } = await supabase.rpc('generate_referral_code');
      if (error) throw error;

      setMyReferralCode(data);
      return data;
    } catch (error) {
      console.error('Error generating referral code:', error);
      toast.error("Erreur lors de la génération du code");
      return null;
    }
  };

  const sendInvitation = async () => {
    if (!newEmail.trim()) {
      toast.error("Veuillez saisir une adresse email");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      // Generate referral code if not exists
      let code = myReferralCode;
      if (!code) {
        code = await generateReferralCode();
        if (!code) throw new Error("Impossible de générer le code");
      }

      const { error } = await supabase
        .from('referrals')
        .insert({
          referrer_user_id: user.id,
          referred_email: newEmail.toLowerCase().trim(),
          referral_code: code,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("Cette personne a déjà été invitée");
          return;
        }
        throw error;
      }

      toast.success("Invitation envoyée !");
      setNewEmail("");
      fetchReferrals();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error("Erreur lors de l'envoi de l'invitation");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!myReferralCode) return;
    
    const referralLink = `${window.location.origin}/auth?ref=${myReferralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast.success("Lien copié dans le presse-papiers !");
  };

  const shareViaEmail = () => {
    if (!myReferralCode) return;
    
    const referralLink = `${window.location.origin}/auth?ref=${myReferralCode}`;
    const subject = "Rejoins-moi sur UniSubHub !";
    const body = `Salut !\n\nJe t'invite à découvrir UniSubHub, l'app qui m'aide à gérer tous mes abonnements.\n\nInscris-toi via ce lien et nous bénéficierons tous les deux d'avantages :\n${referralLink}\n\nÀ bientôt sur UniSubHub !`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-warning border-warning">En attente</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-success border-success">Inscrit</Badge>;
      case 'rewarded':
        return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Récompensé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full">
            <Crown className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Programme de Parrainage
            </span>
          </div>
          <h1 className="text-3xl font-bold">Invite tes amis</h1>
          <p className="text-muted-foreground">
            <strong>2 amis invités = 1 mois offert</strong> sur ton abonnement Premium
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-warning" />
                <span className="text-2xl font-bold">{stats.pending}</span>
              </div>
              <p className="text-sm text-muted-foreground">En attente</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-4 w-4 text-success" />
                <span className="text-2xl font-bold">{stats.completed}</span>
              </div>
              <p className="text-sm text-muted-foreground">Inscrits</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-purple-500" />
                <span className="text-2xl font-bold">{stats.rewarded}</span>
              </div>
              <p className="text-sm text-muted-foreground">Récompensés</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="h-4 w-4 text-pink-500" />
                <span className="text-2xl font-bold">{Math.floor(stats.completed / 2)}</span>
              </div>
              <p className="text-sm text-muted-foreground">Mois gagnés</p>
            </CardContent>
          </Card>
        </div>

        {/* Invite Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Inviter un ami
            </CardTitle>
            <CardDescription>
              Partage ton lien de parrainage ou envoie une invitation directe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email Invitation */}
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email de ton ami</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="ami@exemple.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={sendInvitation} disabled={loading}>
                  {loading ? "Envoi..." : "Inviter"}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Referral Link */}
            <div className="space-y-2">
              <Label>Ton lien de parrainage</Label>
              <div className="flex gap-2">
                <Input
                  value={myReferralCode ? `${window.location.origin}/auth?ref=${myReferralCode}` : "Génération en cours..."}
                  readOnly
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={copyReferralLink} disabled={!myReferralCode}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={shareViaEmail} disabled={!myReferralCode}>
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referrals List */}
        <Card>
          <CardHeader>
            <CardTitle>Mes parrainages</CardTitle>
            <CardDescription>
              Suivi de tes invitations et récompenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun parrainage pour le moment</p>
                <p className="text-sm">Commence par inviter tes premiers amis !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{referral.referred_email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invité le {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(referral.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}