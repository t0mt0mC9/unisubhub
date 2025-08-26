import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface EditSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: any;
  onSuccess: () => void;
  onDeleteMockSubscription?: (id: string) => void;
}

const categories = [
  "Streaming",
  "Cloud & Stockage",
  "Productivité",
  "Fitness & Santé",
  "Gaming",
  "Actualités & Magazines",
  "Musique",
  "Éducation",
  "Sécurité",
  "Design & Créativité",
  "Autre"
];

const billingCycles = [
  { value: "monthly", label: "Mensuel" },
  { value: "yearly", label: "Annuel" },
  { value: "weekly", label: "Hebdomadaire" }
];

const statusOptions = [
  { value: "active", label: "Actif" },
  { value: "inactive", label: "Inactif" },
  { value: "cancelled", label: "Annulé" }
];

export const EditSubscriptionDialog = ({ open, onOpenChange, subscription, onSuccess, onDeleteMockSubscription }: EditSubscriptionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [formData, setFormData] = useState({
    name: subscription?.name || "",
    description: subscription?.description || "",
    price: subscription?.price?.toString() || "",
    currency: subscription?.currency || "EUR",
    billing_cycle: subscription?.billing_cycle || "monthly",
    category: subscription?.category || "",
    next_billing_date: subscription?.next_billing_date ? new Date(subscription.next_billing_date) : new Date(),
    website_url: subscription?.website_url || "",
    status: subscription?.status || "active"
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }


    setLoading(true);

    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          currency: formData.currency,
          billing_cycle: formData.billing_cycle,
          category: formData.category,
          next_billing_date: format(formData.next_billing_date, 'yyyy-MM-dd'),
          website_url: formData.website_url,
          status: formData.status
        })
        .eq("id", subscription.id);

      if (error) throw error;

      toast({
        title: "Abonnement modifié",
        description: `${formData.name} a été modifié avec succès`,
      });

      onSuccess();
      onOpenChange(false);
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

  const handleDelete = async () => {
    setLoading(true);

    try {
      console.log('Attempting to delete subscription:', subscription.id, 'type:', typeof subscription.id);
      
      // Check if this is a mock subscription (string ID vs UUID)
      const isMockSubscription = typeof subscription.id === 'string' && subscription.id.length < 10;
      
      if (isMockSubscription) {
        // Handle mock subscription deletion
        if (onDeleteMockSubscription) {
          onDeleteMockSubscription(subscription.id);
          toast({
            title: "Abonnement supprimé",
            description: `${subscription.name} a été supprimé avec succès`,
          });
        }
      } else {
        // Handle real subscription deletion from database
        const { data, error } = await supabase
          .from("subscriptions")
          .delete()
          .eq("id", subscription.id)
          .select();

        console.log('Delete response:', { data, error });

        if (error) throw error;

        toast({
          title: "Abonnement supprimé",
          description: `${subscription.name} a été supprimé avec succès`,
        });
      }

      onSuccess();
      onOpenChange(false);
      setShowDeleteAlert(false);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!subscription) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'abonnement</DialogTitle>
            <DialogDescription>
              Modifiez les informations de votre abonnement {subscription.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du service *</Label>
                <Input
                  id="name"
                  placeholder="Netflix, Spotify..."
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateFormData("category", value)}
                  disabled={loading}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description optionnelle du service..."
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="9.99"
                  value={formData.price}
                  onChange={(e) => updateFormData("price", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => updateFormData("currency", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_cycle">Fréquence *</Label>
                <Select
                  value={formData.billing_cycle}
                  onValueChange={(value) => updateFormData("billing_cycle", value)}
                  disabled={loading}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {billingCycles.map((cycle) => (
                      <SelectItem key={cycle.value} value={cycle.value}>
                        {cycle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateFormData("status", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prochaine facturation *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.next_billing_date && "text-muted-foreground"
                      )}
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.next_billing_date
                        ? format(formData.next_billing_date, "PPP", { locale: fr })
                        : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.next_billing_date}
                      onSelect={(date) => updateFormData("next_billing_date", date || new Date())}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url">Site web</Label>
                <Input
                  id="website_url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website_url}
                  onChange={(e) => updateFormData("website_url", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-between space-x-3">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteAlert(true)}
                disabled={loading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={loading} className="min-w-[120px]">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sauvegarder
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'abonnement</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'abonnement "{subscription.name}" ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};