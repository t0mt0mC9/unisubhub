import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export const PrivacyPolicyPage = ({ onBack }: PrivacyPolicyPageProps) => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Politique de confidentialité</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Collecte des informations</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                UniSubHub collecte uniquement les informations nécessaires au fonctionnement du service :
              </p>
              <ul>
                <li>Informations de compte (email, nom d'utilisateur)</li>
                <li>Données d'abonnements que vous ajoutez manuellement</li>
                <li>Préférences et paramètres de l'application</li>
                <li>Données d'utilisation anonymisées pour améliorer le service</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Utilisation des données</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>Vos données sont utilisées pour :</p>
              <ul>
                <li>Fournir et maintenir le service UniSubHub</li>
                <li>Gérer votre compte et vos abonnements</li>
                <li>Vous envoyer des notifications importantes</li>
                <li>Améliorer l'expérience utilisateur</li>
                <li>Assurer la sécurité de la plateforme</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Partage des données</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Nous ne vendons, n'échangeons ni ne louons vos informations personnelles à des tiers.
                Vos données peuvent être partagées uniquement dans les cas suivants :
              </p>
              <ul>
                <li>Avec votre consentement explicite</li>
                <li>Pour répondre à des obligations légales</li>
                <li>Avec nos prestataires de services (hébergement, analytics) sous contrat strict</li>
                <li>En cas de fusion ou acquisition (avec notification préalable)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Sécurité des données</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Nous mettons en place des mesures de sécurité appropriées pour protéger vos données :
              </p>
              <ul>
                <li>Chiffrement des données en transit et au repos</li>
                <li>Authentification sécurisée</li>
                <li>Accès limité aux données par le personnel autorisé</li>
                <li>Surveillance continue des systèmes</li>
                <li>Sauvegardes régulières et sécurisées</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Vos droits</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>Conformément au RGPD, vous avez le droit de :</p>
              <ul>
                <li>Accéder à vos données personnelles</li>
                <li>Rectifier des données inexactes</li>
                <li>Supprimer vos données (droit à l'oubli)</li>
                <li>Limiter le traitement de vos données</li>
                <li>Porter vos données vers un autre service</li>
                <li>Vous opposer au traitement de vos données</li>
              </ul>
              <p>
                Pour exercer ces droits, contactez-nous à l'adresse : privacy@unisubhub.com
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookies et technologies similaires</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                UniSubHub utilise des cookies et technologies similaires pour :
              </p>
              <ul>
                <li>Maintenir votre session connectée</li>
                <li>Sauvegarder vos préférences</li>
                <li>Analyser l'utilisation du service (données anonymisées)</li>
              </ul>
              <p>
                Vous pouvez gérer les cookies dans les paramètres de votre navigateur.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Conservation des données</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Nous conservons vos données aussi longtemps que nécessaire pour fournir le service
                ou répondre à des obligations légales. En cas de suppression de compte, vos données
                sont supprimées dans un délai de 30 jours, sauf obligation légale contraire.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Modifications de cette politique</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Cette politique de confidentialité peut être mise à jour occasionnellement.
                Nous vous notifierons de tout changement important par email ou via l'application.
                La version en vigueur est toujours disponible dans l'application.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contact</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Pour toute question concernant cette politique de confidentialité ou vos données
                personnelles, contactez-nous :
              </p>
              <ul>
                <li>Email : privacy@unisubhub.com</li>
                <li>Support : support@unisubhub.com</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};