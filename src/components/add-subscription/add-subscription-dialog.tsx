import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ManualAddForm } from "./manual-add-form";
import { UserPlus } from "lucide-react";

interface AddSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscriptionAdded?: () => void;
}

export const AddSubscriptionDialog = ({ open, onOpenChange, onSubscriptionAdded }: AddSubscriptionDialogProps) => {
  const handleSuccess = () => {
    onOpenChange(false);
    onSubscriptionAdded?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un abonnement</DialogTitle>
          <DialogDescription>
            Ajoutez manuellement vos abonnements pour suivre vos dépenses.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <ManualAddForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
};