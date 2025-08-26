import { 
  Smartphone, 
  Newspaper, 
  Music, 
  Gamepad2, 
  ShoppingBag, 
  Car, 
  Dumbbell, 
  GraduationCap, 
  Briefcase, 
  Home, 
  Utensils, 
  Camera, 
  Headphones, 
  Book, 
  Heart, 
  Plane, 
  Shield, 
  TrendingUp,
  LucideIcon
} from "lucide-react";

// Interface pour le mapping des catégories
interface CategoryIcon {
  icon: LucideIcon;
  color: string;
}

// Mapping des catégories vers leurs icônes et couleurs
export const categoryIconMap: Record<string, CategoryIcon> = {
  // Streaming et divertissement
  'streaming': { icon: Smartphone, color: 'text-red-500' },
  'video': { icon: Smartphone, color: 'text-red-500' },
  'divertissement': { icon: Smartphone, color: 'text-red-500' },
  
  // Actualités et presse
  'actualités': { icon: Newspaper, color: 'text-blue-500' },
  'news': { icon: Newspaper, color: 'text-blue-500' },
  'presse': { icon: Newspaper, color: 'text-blue-500' },
  'information': { icon: Newspaper, color: 'text-blue-500' },
  
  // Musique et audio
  'musique': { icon: Music, color: 'text-green-500' },
  'audio': { icon: Headphones, color: 'text-green-500' },
  'podcast': { icon: Headphones, color: 'text-green-500' },
  
  // Gaming
  'gaming': { icon: Gamepad2, color: 'text-purple-500' },
  'jeux': { icon: Gamepad2, color: 'text-purple-500' },
  'jeu': { icon: Gamepad2, color: 'text-purple-500' },
  
  // E-commerce et shopping
  'shopping': { icon: ShoppingBag, color: 'text-pink-500' },
  'e-commerce': { icon: ShoppingBag, color: 'text-pink-500' },
  'commerce': { icon: ShoppingBag, color: 'text-pink-500' },
  
  // Transport
  'transport': { icon: Car, color: 'text-gray-500' },
  'voiture': { icon: Car, color: 'text-gray-500' },
  'véhicule': { icon: Car, color: 'text-gray-500' },
  'taxi': { icon: Car, color: 'text-gray-500' },
  
  // Sport et fitness
  'sport': { icon: Dumbbell, color: 'text-orange-500' },
  'fitness': { icon: Dumbbell, color: 'text-orange-500' },
  'santé': { icon: Heart, color: 'text-red-400' },
  'bien-être': { icon: Heart, color: 'text-red-400' },
  
  // Éducation
  'éducation': { icon: GraduationCap, color: 'text-indigo-500' },
  'formation': { icon: GraduationCap, color: 'text-indigo-500' },
  'apprentissage': { icon: Book, color: 'text-indigo-500' },
  
  // Professionnel
  'professionnel': { icon: Briefcase, color: 'text-slate-600' },
  'business': { icon: Briefcase, color: 'text-slate-600' },
  'travail': { icon: Briefcase, color: 'text-slate-600' },
  'productivité': { icon: TrendingUp, color: 'text-slate-600' },
  
  // Maison et lifestyle
  'maison': { icon: Home, color: 'text-amber-500' },
  'lifestyle': { icon: Home, color: 'text-amber-500' },
  'domestique': { icon: Home, color: 'text-amber-500' },
  
  // Alimentation
  'alimentation': { icon: Utensils, color: 'text-yellow-500' },
  'nourriture': { icon: Utensils, color: 'text-yellow-500' },
  'livraison': { icon: Utensils, color: 'text-yellow-500' },
  
  // Photo et vidéo
  'photo': { icon: Camera, color: 'text-cyan-500' },
  'photographie': { icon: Camera, color: 'text-cyan-500' },
  'créatif': { icon: Camera, color: 'text-cyan-500' },
  
  // Voyage
  'voyage': { icon: Plane, color: 'text-sky-500' },
  'tourisme': { icon: Plane, color: 'text-sky-500' },
  'vacances': { icon: Plane, color: 'text-sky-500' },
  
  // Sécurité et assurance
  'sécurité': { icon: Shield, color: 'text-emerald-600' },
  'assurance': { icon: Shield, color: 'text-emerald-600' },
  'protection': { icon: Shield, color: 'text-emerald-600' },
};

// Fonction pour obtenir l'icône d'une catégorie
export const getCategoryIcon = (category: string): CategoryIcon => {
  const normalizedCategory = category.toLowerCase().trim();
  
  // Recherche exacte d'abord
  if (categoryIconMap[normalizedCategory]) {
    return categoryIconMap[normalizedCategory];
  }
  
  // Recherche partielle (si la catégorie contient un mot-clé)
  for (const [key, value] of Object.entries(categoryIconMap)) {
    if (normalizedCategory.includes(key) || key.includes(normalizedCategory)) {
      return value;
    }
  }
  
  // Icône par défaut
  return { icon: Smartphone, color: 'text-muted-foreground' };
};

// Composant réutilisable pour afficher l'icône de catégorie
export const CategoryIcon = ({ 
  category, 
  size = 24, 
  className = "" 
}: { 
  category: string; 
  size?: number; 
  className?: string; 
}) => {
  const { icon: IconComponent, color } = getCategoryIcon(category);
  
  return (
    <IconComponent 
      size={size} 
      className={`${color} ${className}`} 
    />
  );
};