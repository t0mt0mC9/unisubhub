import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  BarChart3, 
  Bell, 
  Shield, 
  Smartphone, 
  TrendingUp,
  CheckCircle,
  Star,
  Euro,
  Calendar,
  ArrowRight,
  Play,
  Users,
  Target,
  Zap
} from "lucide-react";

const Landing = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: CreditCard,
      title: "Gestion centralisée",
      description: "Tous vos abonnements en un seul endroit. Ajout automatique ou manuel selon vos préférences.",
      gradient: "from-primary to-primary-light"
    },
    {
      icon: BarChart3,
      title: "Analyses détaillées",
      description: "Visualisez vos dépenses avec des graphiques interactifs et des recommandations personnalisées.",
      gradient: "from-success to-warning"
    },
    {
      icon: Bell,
      title: "Alertes intelligentes",
      description: "Recevez des notifications avant les renouvellements et détectez les abonnements inutilisés.",
      gradient: "from-warning to-destructive"
    },
    {
      icon: Shield,
      title: "Sécurité maximale",
      description: "Vos données sont protégées avec un chiffrement de niveau bancaire et une confidentialité totale.",
      gradient: "from-accent to-primary"
    }
  ];

  const stats = [
    { value: "€2,400", label: "Économies moyennes par an", icon: Euro },
    { value: "15+", label: "Abonnements suivis en moyenne", icon: Target },
    { value: "98%", label: "Satisfaction utilisateur", icon: Star },
    { value: "24/7", label: "Surveillance continue", icon: Zap }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Entrepreneur",
      content: "UniSubHub m'a fait économiser plus de 200€ par mois en identifiant mes abonnements oubliés.",
      rating: 5
    },
    {
      name: "Thomas Martin",
      role: "Designer",
      content: "L'interface est sublime et les analyses sont d'une précision remarquable. Un outil indispensable !",
      rating: 5
    },
    {
      name: "Sophie Chen",
      role: "Product Manager",
      content: "Enfin une solution qui comprend vraiment les besoins des utilisateurs modernes.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                UniSubHub
              </span>
            </div>
            <Button 
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
              onClick={() => window.location.href = '/auth'}
            >
              Se connecter
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-surface to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,transparent_50%)] opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent))_0%,transparent_50%)] opacity-10" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 border-primary/20 text-primary">
              ✨ Nouvelle version disponible
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Maîtrisez vos{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                abonnements
              </span>
              <br />
              comme jamais
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              UniSubHub révolutionne la gestion de vos abonnements avec une interface moderne, 
              des analyses poussées et une sécurité de niveau bancaire.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-8 py-6 text-lg"
                onClick={() => window.location.href = '/auth'}
              >
                <Play className="mr-2 h-5 w-5" />
                Commencer gratuitement
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-6 text-lg border-primary/20 hover:bg-primary/5"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Voir la démo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="text-center p-4 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm"
                >
                  <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/20 text-primary">
              Fonctionnalités
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une suite complète d'outils pour optimiser vos abonnements et maîtriser vos dépenses récurrentes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`relative overflow-hidden transition-all duration-300 border-border/50 hover:border-primary/20 hover:shadow-glow cursor-pointer ${
                  hoveredFeature === index ? 'scale-105' : ''
                }`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5`} />
                <CardHeader className="relative">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/20 text-primary">
              Interface
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Design pensé pour l'excellence
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une interface moderne et intuitive qui rend la gestion d'abonnements agréable et efficace.
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-surface via-card to-surface-elevated rounded-2xl p-8 border border-border shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-background to-surface rounded-lg border border-border/50 flex items-center justify-center">
                <div className="text-center">
                  <Smartphone className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2">Interface de démonstration</h3>
                  <p className="text-muted-foreground">Découvrez l'expérience UniSubHub</p>
                  <Button 
                    className="mt-4 bg-gradient-primary hover:opacity-90 text-primary-foreground"
                    onClick={() => window.location.href = '/auth'}
                  >
                    Essayer maintenant
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-surface/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/20 text-primary">
              Témoignages
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez pourquoi des milliers d'utilisateurs ont choisi UniSubHub pour gérer leurs abonnements.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à reprendre le contrôle ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Rejoignez des milliers d'utilisateurs qui ont déjà optimisé leurs abonnements avec UniSubHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-8 py-6 text-lg"
                onClick={() => window.location.href = '/auth'}
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-6 text-lg border-primary/20 hover:bg-primary/5"
              >
                En savoir plus
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  UniSubHub
                </span>
              </div>
              <p className="text-muted-foreground">
                La solution moderne pour maîtriser vos abonnements et optimiser vos dépenses récurrentes.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Sécurité</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carrières</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 UniSubHub. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;