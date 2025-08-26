import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Settings, LogOut } from "lucide-react";

interface ProfilePageProps {
  onSignOut: () => void;
}

export function ProfilePage({ onSignOut }: ProfilePageProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        setUser(user);
        
        // Si l'utilisateur a des métadonnées, les charger
        if (user?.user_metadata) {
          setFormData({
            firstName: user.user_metadata.first_name || '',
            lastName: user.user_metadata.last_name || '',
            phone: user.user_metadata.phone || ''
          });
        }
      } catch (error: any) {
        console.error("Erreur lors du chargement du profil:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [toast]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
        }
      });

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées",
      });
      
      setEditing(false);
      
      // Recharger les données utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
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

  const getInitials = () => {
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName} ${formData.lastName}`;
    }
    return user?.email || 'Utilisateur';
  };

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profil principal */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" />
              <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{getDisplayName()}</CardTitle>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Votre nom"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Votre numéro de téléphone"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={loading} className="flex-1">
                  {loading ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Nom complet</p>
                    <p className="text-sm text-muted-foreground">
                      {getDisplayName()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                {formData.phone && (
                  <div className="flex items-center space-x-3">
                    <span className="h-4 w-4 text-muted-foreground">📱</span>
                    <div>
                      <p className="text-sm font-medium">Téléphone</p>
                      <p className="text-sm text-muted-foreground">{formData.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Membre depuis</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={() => setEditing(true)} className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Modifier le profil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions du compte */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              toast({
                title: "Changer le mot de passe",
                description: "Fonctionnalité bientôt disponible",
              });
            }}
          >
            <Settings className="mr-2 h-4 w-4" />
            Changer le mot de passe
          </Button>
          
          <Separator />
          
          <Button 
            variant="destructive" 
            className="w-full justify-start"
            onClick={onSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}