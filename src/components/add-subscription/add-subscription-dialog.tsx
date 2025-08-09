import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManualAddForm } from "./manual-add-form";
import { BankConnectionForm } from "./bank-connection-form";
import { UserPlus, CreditCard } from "lucide-react";

interface AddSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscriptionAdded?: () => void;
}

export const AddSubscriptionDialog = ({ open, onOpenChange, onSubscriptionAdded }: AddSubscriptionDialogProps) => {
  const [activeTab, setActiveTab] = useState("manual");

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
            Ajoutez manuellement un abonnement ou connectez votre banque pour une détection automatique.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Ajout manuel
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Connexion bancaire
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-6">
            <ManualAddForm onSuccess={handleSuccess} />
          </TabsContent>

          <TabsContent value="bank" className="mt-6">
            <BankConnectionForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};