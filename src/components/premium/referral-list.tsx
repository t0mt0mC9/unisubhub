import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Referral } from "@/hooks/use-referrals";

interface ReferralListProps {
  referrals: Referral[];
  onDeleteReferral: (referralId: string) => Promise<boolean>;
}

export function ReferralList({ referrals, onDeleteReferral }: ReferralListProps) {
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [referralToDelete, setReferralToDelete] = useState<Referral | null>(null);

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

  const handleDeleteReferral = (referral: Referral) => {
    setReferralToDelete(referral);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteReferral = async () => {
    if (!referralToDelete) return;

    setDeleteLoading(referralToDelete.id);
    try {
      const success = await onDeleteReferral(referralToDelete.id);
      if (success) {
        setDeleteDialogOpen(false);
        setReferralToDelete(null);
      }
    } finally {
      setDeleteLoading(null);
    }
  };

  if (referrals.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tes invitations ({referrals.length})</CardTitle>
          <CardDescription>
            Suivi de tes invitations et récompenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {referrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{referral.referred_email}</p>
                  <p className="text-sm text-muted-foreground">
                    Invité le {new Date(referral.created_at).toLocaleDateString('fr-FR')}
                    {referral.completed_at && (
                      <> • Inscrit le {new Date(referral.completed_at).toLocaleDateString('fr-FR')}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(referral.status)}
                  {referral.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReferral(referral)}
                      disabled={deleteLoading === referral.id}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'invitation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'invitation envoyée à {referralToDelete?.referred_email} ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteReferral}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}