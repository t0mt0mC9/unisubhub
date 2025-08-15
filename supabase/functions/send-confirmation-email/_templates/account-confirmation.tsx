import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Button,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface AccountConfirmationEmailProps {
  confirmation_link: string
  user_email: string
}

export const AccountConfirmationEmail = ({
  confirmation_link,
  user_email,
}: AccountConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>🎉 Confirmez votre compte UniSubHub pour commencer !</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Logo Section */}
        <Section style={logoSection}>
          <Text style={logoText}>UniSubHub</Text>
          <Text style={logoSubtext}>Maîtrisez vos abonnements</Text>
        </Section>
        
        <Heading style={h1}>🎉 Bienvenue sur UniSubHub !</Heading>
        
        <Text style={text}>
          Bonjour et merci de vous être inscrit(e) !
        </Text>
        
        <Text style={text}>
          Votre compte <strong>{user_email}</strong> a été créé avec succès ! 
          Vous pouvez maintenant profiter de toutes nos fonctionnalités.
        </Text>

        <Section style={benefitsSection}>
          <Text style={benefitsTitle}>Avec votre compte UniSubHub, vous pourrez :</Text>
          <Text style={benefitItem}>✅ Centraliser tous vos abonnements en un seul endroit</Text>
          <Text style={benefitItem}>✅ Suivre vos dépenses mensuelles et annuelles</Text>
          <Text style={benefitItem}>✅ Recevoir des alertes avant les renouvellements</Text>
          <Text style={benefitItem}>✅ Analyser vos habitudes de consommation</Text>
          <Text style={benefitItem}>✅ Éviter les facturations surprises</Text>
          <Text style={benefitItem}>✅ Inviter des amis et obtenir des mois gratuits</Text>
        </Section>

        <Section style={ctaSection}>
          <Button
            href={confirmation_link}
            style={button}
          >
            🚀 Accéder à mon compte
          </Button>
        </Section>

        <Text style={text}>
          Ou copiez ce lien dans votre navigateur :
        </Text>
        <Text style={linkText}>{confirmation_link}</Text>

        <Hr style={hr} />

        <Text style={text}>
          <strong>Votre compte est maintenant actif !</strong>
        </Text>
        <Text style={smallText}>
          • Votre compte est immédiatement utilisable<br/>
          • Toutes les fonctionnalités sont déjà disponibles<br/>
          • Vous recevrez des notifications importantes<br/>
          • Commencez dès maintenant à gérer vos abonnements
        </Text>

        <Text style={footer}>
          Si vous n'avez pas créé de compte UniSubHub, vous pouvez ignorer cet email en toute sécurité.
        </Text>

        <Section style={brandSection}>
          <Text style={brandText}>
            UniSubHub - Maîtrisez vos abonnements
          </Text>
          <Text style={brandSubtext}>
            Simplifiez votre vie financière
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default AccountConfirmationEmail

const main = {
  backgroundColor: '#0f0f23', // Background sombre UniSubHub
  fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif',
}

const container = {
  backgroundColor: '#1a1a2e', // Container sombre
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
  border: '1px solid #16213e',
}

const h1 = {
  color: '#ffffff', // Texte blanc sur fond sombre
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const text = {
  color: '#e2e8f0', // Texte gris clair
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
}

const smallText = {
  color: '#cbd5e1',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '12px 0',
  padding: '0 40px',
}

const benefitsSection = {
  margin: '32px 0',
  padding: '24px 40px',
  backgroundColor: '#16213e', // Couleur accent UniSubHub
  borderRadius: '8px',
  marginLeft: '40px',
  marginRight: '40px',
  border: '1px solid #8b5cf6',
}

const benefitsTitle = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
}

const benefitItem = {
  color: '#cbd5e1', // Texte plus clair pour les bénéfices
  fontSize: '14px',
  lineHeight: '22px',
  margin: '8px 0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  background: 'linear-gradient(135deg, #8b5cf6, #a855f7)', // Dégradé violet UniSubHub
  borderRadius: '8px',
  color: '#fff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '18px 40px',
  margin: '0 auto',
  border: 'none',
  boxShadow: '0 8px 20px 0 rgba(139, 92, 246, 0.4)',
  transition: 'all 0.3s ease',
}

const linkText = {
  color: '#a855f7', // Violet clair UniSubHub
  fontSize: '14px',
  padding: '0 40px',
  wordBreak: 'break-all' as const,
  backgroundColor: '#16213e',
  borderRadius: '4px',
  margin: '16px 40px',
  padding: '12px',
  border: '1px solid #8b5cf6',
}

const hr = {
  borderColor: '#16213e',
  margin: '32px 40px',
}

const footer = {
  color: '#94a3b8',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '24px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const brandSection = {
  textAlign: 'center' as const,
  margin: '32px 0 0 0',
  padding: '24px 40px',
  borderTop: '1px solid #16213e',
  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))',
}

const brandText = {
  color: '#8b5cf6',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}

const brandSubtext = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '0',
  fontStyle: 'italic',
}

const logoSection = {
  textAlign: 'center' as const,
  padding: '20px 40px 0',
  borderBottom: '2px solid #8b5cf6',
  marginBottom: '20px',
  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(168, 85, 247, 0.05))',
}

const logoText = {
  color: '#8b5cf6',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '-0.5px',
}

const logoSubtext = {
  color: '#94a3b8',
  fontSize: '14px',
  margin: '0 0 16px 0',
  fontStyle: 'italic',
}