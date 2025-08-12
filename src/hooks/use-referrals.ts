import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Referral {
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

export interface ReferralStats {
  pending: number;
  completed: number;
  rewarded: number;
  totalRewards: number;
}

export const useReferrals = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [myReferralCode, setMyReferralCode] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<ReferralStats>({
    pending: 0,
    completed: 0,
    rewarded: 0,
    totalRewards: 0
  });

  useEffect(() => {
    getCurrentUser();
    fetchReferrals();
    generateOrGetMyReferralCode();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const generateOrGetMyReferralCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingReferrals } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_user_id', user.id)
        .limit(1);

      if (existingReferrals && existingReferrals.length > 0) {
        setMyReferralCode(existingReferrals[0].referral_code);
        return;
      }

      const savedCode = localStorage.getItem(`referral_code_${user.id}`);
      if (savedCode) {
        setMyReferralCode(savedCode);
      }
    } catch (error) {
      console.error('Error getting referral code:', error);
    }
  };

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

  const generateReferralCode = async (retryCount = 0) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.rpc('generate_referral_code');
      
      if (error) {
        console.error('RPC error:', error);
        throw error;
      }

      localStorage.setItem(`referral_code_${user.id}`, data);
      setMyReferralCode(data);
      return data;
    } catch (error) {
      console.error('Error generating referral code:', error);
      
      if (retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return generateReferralCode(retryCount + 1);
      }
      
      toast.error("Erreur lors de la génération du code de parrainage");
      return null;
    }
  };

  const sendInvitation = async (email: string) => {
    if (!email.trim()) {
      toast.error("Veuillez saisir une adresse email");
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      let code = await generateReferralCode();
      if (!code) {
        toast.error("Impossible de générer un code de parrainage");
        return false;
      }

      const { error: dbError } = await supabase
        .from('referrals')
        .insert({
          referrer_user_id: user.id,
          referred_email: email.toLowerCase().trim(),
          referral_code: code,
          status: 'pending'
        });

      if (dbError) {
        if (dbError.code === '23505') {
          if (dbError.message.includes('referrals_referrer_email_unique')) {
            toast.error("Vous avez déjà invité cette personne");
            return false;
          } else if (dbError.message.includes('referrals_referral_code_key')) {
            const newCode = await generateReferralCode();
            if (newCode) {
              const { error: retryError } = await supabase
                .from('referrals')
                .insert({
                  referrer_user_id: user.id,
                  referred_email: email.toLowerCase().trim(),
                  referral_code: newCode,
                  status: 'pending'
                });
              
              if (retryError) {
                console.error('Retry failed:', retryError);
                if (retryError.code === '23505' && retryError.message.includes('referrals_referrer_email_unique')) {
                  toast.error("Vous avez déjà invité cette personne");
                } else {
                  toast.error("Erreur lors de la création de l'invitation");
                }
                return false;
              }
              code = newCode;
            } else {
              toast.error("Impossible de générer un code unique");
              return false;
            }
          }
        } else {
          throw dbError;
        }
      }

      const finalCode = code || await generateReferralCode();
      const referralLink = `${window.location.origin}/auth?ref=${finalCode}`;
      
      const { error: emailError } = await supabase.functions.invoke('send-referral-email', {
        body: {
          referral_code: finalCode,
          referral_link: referralLink,
          referred_email: email.toLowerCase().trim(),
          referrer_name: user.email?.split('@')[0] || "Un ami"
        }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        toast.error("Erreur lors de l'envoi de l'email: " + emailError.message);
        return false;
      }

      toast.success("Invitation créée et email envoyé !");
      fetchReferrals();
      return true;
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error("Erreur lors de l'envoi de l'invitation");
      return false;
    }
  };

  const deleteReferral = async (referralId: string) => {
    try {
      const { error } = await supabase
        .from('referrals')
        .delete()
        .eq('id', referralId);

      if (error) throw error;

      setReferrals(prevReferrals => 
        prevReferrals.filter(ref => ref.id !== referralId)
      );

      const updatedReferrals = referrals.filter(ref => ref.id !== referralId);
      const pending = updatedReferrals.filter(r => r.status === 'pending').length;
      const completed = updatedReferrals.filter(r => r.status === 'completed').length;
      const rewarded = updatedReferrals.filter(r => r.status === 'rewarded').length;
      setStats({ pending, completed, rewarded, totalRewards: Math.floor(rewarded / 2) });

      toast.success("Invitation supprimée avec succès");
      return true;
    } catch (error) {
      console.error('Error deleting referral:', error);
      toast.error("Erreur lors de la suppression");
      return false;
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

  return {
    referrals,
    myReferralCode,
    currentUser,
    stats,
    sendInvitation,
    deleteReferral,
    copyReferralLink,
    shareViaEmail,
    refreshReferrals: fetchReferrals
  };
};