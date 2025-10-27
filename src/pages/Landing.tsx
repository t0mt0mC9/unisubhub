import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

// Import screenshots
import screenshotOffers from "@/assets/screenshot-offers.png";
import screenshotAnalytics from "@/assets/screenshot-analytics.png";
import screenshotTracking from "@/assets/screenshot-tracking.png";
import screenshotAdd from "@/assets/screenshot-add.png";
import screenshotIdentify from "@/assets/screenshot-identify.png";
import screenshotReferral from "@/assets/screenshot-referral.png";

const Landing = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/auth');
  };

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
      description: "Recevez des notifications avant les facturations et détectez les abonnements inutilisés.",
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
      name: "Sarah Lefevre",
      role: "Entrepreneur",
      content: "UniSubHub m'a fait économiser plus de 200€ par mois en identifiant mes abonnements oubliés.",
      rating: 5
    },
    {
      name: "Antoine Rousseau",
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
              <img 
                src="/lovable-uploads/ad996069-d307-4051-877a-984d6f7152f7.png" 
                alt="UniSubHub Logo" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                UniSubHub
              </span>
            </div>
            <Button 
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
              onClick={handleButtonClick}
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
                onClick={handleButtonClick}
              >
                <Play className="mr-2 h-5 w-5" />
                Commencer gratuitement
              </Button>
            </div>

            {/* Video Demo */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-card">
                <iframe
                  src="https://www.youtube.com/embed/jtOXxW5I2WA"
                  title="Démo UniSubHub"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
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

      {/* Offers Section */}
      <section className="py-20 bg-gradient-to-br from-surface/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--primary))_0%,transparent_50%)] opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5">
              🎁 Nouveau
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Découvrez les meilleures{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                offres d'abonnements
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              En plus de gérer vos abonnements existants, UniSubHub vous fait découvrir en temps réel 
              toutes les promotions et offres spéciales disponibles sur vos services préférés. 
              Économisez encore plus en profitant des meilleures opportunités du moment !
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/20 bg-gradient-to-br from-card/80 to-surface/80 backdrop-blur-sm shadow-glow">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">Offres en temps réel</h3>
                    <p className="text-sm text-muted-foreground">
                      Mise à jour quotidienne des meilleures promotions disponibles
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-success to-warning flex items-center justify-center mx-auto">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">Recommandations ciblées</h3>
                    <p className="text-sm text-muted-foreground">
                      Offres personnalisées basées sur vos abonnements actuels
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto">
                      <Euro className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">Économies maximales</h3>
                    <p className="text-sm text-muted-foreground">
                      Jusqu'à 70% de réduction sur vos services favoris
                    </p>
                  </div>
                </div>
                
                <div className="text-center mt-8">
                  <Button 
                    variant="outline"
                    className="border-primary/30 hover:bg-primary/5"
                    onClick={() => navigate('/auth')}
                  >
                    Voir les offres du moment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-background via-surface to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary))_0%,transparent_50%)] opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/20 text-primary">
              Nos valeurs
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ce qui nous guide
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cinq principes fondamentaux qui orientent chaque décision dans le développement d'UniSubHub.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Clarté</h3>
              <p className="text-sm text-muted-foreground">
                Des données simples et visuelles pour comprendre sa consommation.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-success to-warning flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Contrôle</h3>
              <p className="text-sm text-muted-foreground">
                L'utilisateur reprend la main sur ses paiements.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-warning to-destructive flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Efficacité</h3>
              <p className="text-sm text-muted-foreground">
                Gagner du temps grâce à l'automatisation et aux alertes intelligentes.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Confiance</h3>
              <p className="text-sm text-muted-foreground">
                Sécurité des données et respect de la vie privée au cœur du produit.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Équilibre</h3>
              <p className="text-sm text-muted-foreground">
                Encourager une consommation responsable et durable.
              </p>
            </div>
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

          <div className="relative max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-surface via-card to-surface-elevated rounded-2xl p-8 border border-border shadow-2xl">
              <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6 mb-6">
                {/* Identification Intelligente - Image 1 */}
                <div className="bg-gradient-to-br from-background to-surface rounded-lg border border-border/50 p-4 text-center">
                  <img 
                    src="/lovable-uploads/9d98e4fc-a2ca-4c8c-948b-e01ef055b369.png"
                    alt="Identifiez vos abonnements récurrents facilement"
                    className="w-full h-auto rounded-lg shadow-lg mx-auto"
                  />
                </div>

                {/* Ajout Flexible - Image 2 */}
                <div className="bg-gradient-to-br from-background to-surface rounded-lg border border-border/50 p-4 text-center">
                  <img 
                    src="/lovable-uploads/acffa7a9-4c1a-4033-a482-3899648b5152.png"
                    alt="Ajoutez vos abonnements manuellement ou par connexion bancaire"
                    className="w-full h-auto rounded-lg shadow-lg mx-auto"
                  />
                </div>

                {/* Suivi Détaillé - Image 3 */}
                <div className="bg-gradient-to-br from-background to-surface rounded-lg border border-border/50 p-4 text-center">
                  <img 
                    src="/lovable-uploads/35054287-e657-4a3b-bce6-abf0c243a4d7.png"
                    alt="Suivez votre consommation avec des analyses détaillées"
                    className="w-full h-auto rounded-lg shadow-lg mx-auto"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6">
                {/* Analyses Interactives - Image 4 */}
                <div className="bg-gradient-to-br from-background to-surface rounded-lg border border-border/50 p-4 text-center">
                  <img
                    src="/lovable-uploads/c90fca77-7cfb-438a-bb33-bb48f79f5646.png"
                    alt="Analysez votre consommation avec des graphiques interactifs"
                    className="w-full h-auto rounded-lg shadow-lg mx-auto"
                  />
                </div>

                {/* Offres Exclusives - Image 5 */}
                <div className="bg-gradient-to-br from-background to-surface rounded-lg border border-border/50 p-4 text-center">
                  <img 
                    src="/lovable-uploads/a2ca3511-d5fa-4a85-ac5d-d27f71abde25.png"
                    alt="Découvrez des offres à prix réduits sur vos abonnements"
                    className="w-full h-auto rounded-lg shadow-lg mx-auto"
                  />
                </div>

                {/* Programme de Parrainage - Image 6 */}
                <div className="bg-gradient-to-br from-background to-surface rounded-lg border border-border/50 p-4 text-center">
                  <img 
                    src="/lovable-uploads/92ba3481-36ee-47cc-9713-1e9b6bb87537.png"
                    alt="Parrainez vos amis et obtenez des mois d'abonnements gratuits"
                    className="w-full h-auto rounded-lg shadow-lg mx-auto"
                  />
                </div>
              </div>
              
              <div className="text-center mt-8">
                <Button 
                  className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-8 py-3 text-lg"
                  onClick={handleButtonClick}
                >
                  Essayer maintenant
                </Button>
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
                onClick={handleButtonClick}
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
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
                <img 
                  src="/lovable-uploads/ad996069-d307-4051-877a-984d6f7152f7.png" 
                  alt="UniSubHub Logo" 
                  className="w-8 h-8"
                />
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