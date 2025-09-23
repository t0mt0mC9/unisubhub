import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserSettings } from "@/hooks/use-user-settings";

interface ManualAddFormProps {
  onSuccess: () => void;
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

export const ManualAddForm = ({ onSuccess }: ManualAddFormProps) => {
  const [loading, setLoading] = useState(false);
  const { settings } = useUserSettings();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "EUR", // Fixé à EUR
    billing_cycle: "monthly",
    category: "",
    next_billing_date: new Date(),
    website_url: ""
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      console.log('Inserting subscription with data:', {
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        billing_cycle: formData.billing_cycle,
        category: formData.category,
        next_billing_date: format(formData.next_billing_date, 'yyyy-MM-dd'),
        website_url: formData.website_url,
        auto_detected: false,
        status: "active"
      });

      const { error } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        billing_cycle: formData.billing_cycle,
        category: formData.category,
        next_billing_date: format(formData.next_billing_date, 'yyyy-MM-dd'),
        website_url: formData.website_url,
        auto_detected: false,
        status: "active"
      });

      if (error) throw error;

      // Vérifier le budget après ajout de l'abonnement
      try {
        const { error: budgetError } = await supabase.functions.invoke('check-budget-realtime', {
          body: { userId: user.id }
        });
        if (budgetError) {
          console.error('Erreur vérification budget:', budgetError);
        }
      } catch (budgetError) {
        console.error('Erreur vérification budget:', budgetError);
      }

      toast({
        title: "Abonnement ajouté",
        description: `${formData.name} a été ajouté avec succès`,
      });

      onSuccess();
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

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Prix (€) *</Label>
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

      <div className="flex justify-end space-x-3">
        <Button type="submit" disabled={loading} className="min-w-[120px]">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Ajouter
        </Button>
      </div>
    </form>
  );
};