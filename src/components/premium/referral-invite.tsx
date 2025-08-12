import { useState } from "react";
import { Share2, Copy, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface ReferralInviteProps {
  myReferralCode: string;
  onSendInvitation: (email: string) => Promise<boolean>;
  onCopyLink: () => void;
  onShareEmail: () => void;
}

export function ReferralInvite({ 
  myReferralCode, 
  onSendInvitation, 
  onCopyLink, 
  onShareEmail 
}: ReferralInviteProps) {
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendInvitation = async () => {
    setLoading(true);
    try {
      const success = await onSendInvitation(newEmail);
      if (success) {
        setNewEmail("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
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
            <Button onClick={handleSendInvitation} disabled={loading}>
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
              readOnly
              value={myReferralCode ? `${window.location.origin}/auth?ref=${myReferralCode}` : "Génération en cours..."}
              className="flex-1"
            />
            <Button variant="outline" onClick={onCopyLink} disabled={!myReferralCode}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={onShareEmail} disabled={!myReferralCode}>
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}