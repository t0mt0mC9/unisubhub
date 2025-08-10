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

interface ReferralEmailProps {
  referrer_name?: string
  referral_link: string
  referral_code: string
}

export const ReferralEmail = ({
  referrer_name = "Un ami",
  referral_link,
  referral_code,
}: ReferralEmailProps) => (
  <Html>
    <Head />
    <Preview>🎉 Vous êtes invité(e) à rejoindre UniSubHub !</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Logo Section */}
        <Section style={logoSection}>
          <Text style={logoText}>UniSubHub</Text>
          <Text style={logoSubtext}>Maîtrisez vos abonnements</Text>
        </Section>
        
        <Heading style={h1}>🎉 Invitation UniSubHub</Heading>
        
        <Text style={text}>
          Bonjour !
        </Text>
        
        <Text style={text}>
          <strong>{referrer_name}</strong> vous invite à découvrir <strong>UniSubHub</strong>, 
          l'application qui simplifie la gestion de tous vos abonnements !
        </Text>

        <Section style={benefitsSection}>
          <Text style={benefitsTitle}>Avec UniSubHub, vous pouvez :</Text>
          <Text style={benefitItem}>✅ Centraliser tous vos abonnements en un seul endroit</Text>
          <Text style={benefitItem}>✅ Suivre vos dépenses mensuelles et annuelles</Text>
          <Text style={benefitItem}>✅ Recevoir des alertes avant les renouvellements</Text>
          <Text style={benefitItem}>✅ Analyser vos habitudes de consommation</Text>
          <Text style={benefitItem}>✅ Éviter les facturations surprises</Text>
        </Section>

        <Section style={ctaSection}>
          <Button
            href={referral_link}
            style={button}
          >
            🚀 Rejoindre UniSubHub gratuitement
          </Button>
        </Section>

        <Text style={text}>
          Ou copiez ce lien dans votre navigateur :
        </Text>
        <Text style={linkText}>{referral_link}</Text>

        <Hr style={hr} />

        <Text style={codeSection}>
          <strong>Code de parrainage :</strong> <span style={code}>{referral_code}</span>
        </Text>

        <Text style={footer}>
          En vous inscrivant via ce lien, vous et {referrer_name} bénéficierez d'avantages exclusifs !
        </Text>

        <Text style={disclaimer}>
          Si vous ne souhaitez pas vous inscrire, vous pouvez ignorer cet email en toute sécurité.
        </Text>

        <Section style={brandSection}>
          <Text style={brandText}>
            UniSubHub - Maîtrisez vos abonnements
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReferralEmail

const main = {
  backgroundColor: '#0f0f23', // Background sombre comme UniSubHub
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
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  margin: '0 auto',
  border: 'none',
  boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.3)',
}

const linkText = {
  color: '#a855f7', // Violet clair UniSubHub
  fontSize: '14px',
  padding: '0 40px',
  wordBreak: 'break-all' as const,
}

const hr = {
  borderColor: '#16213e',
  margin: '32px 40px',
}

const codeSection = {
  textAlign: 'center' as const,
  padding: '0 40px',
  margin: '24px 0',
}

const code = {
  backgroundColor: '#16213e',
  borderRadius: '4px',
  color: '#a855f7',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '8px 12px',
  letterSpacing: '2px',
  border: '1px solid #8b5cf6',
}

const footer = {
  color: '#94a3b8',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '24px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const disclaimer = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '24px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const brandSection = {
  textAlign: 'center' as const,
  margin: '32px 0 0 0',
  padding: '16px 40px',
  borderTop: '1px solid #16213e',
}

const brandText = {
  color: '#a855f7',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const logoSection = {
  textAlign: 'center' as const,
  padding: '20px 40px 0',
  borderBottom: '2px solid #8b5cf6',
  marginBottom: '20px',
}

const logoText = {
  color: '#8b5cf6',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 5px 0',
  background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}

const logoSubtext = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '0',
  fontStyle: 'italic',
}