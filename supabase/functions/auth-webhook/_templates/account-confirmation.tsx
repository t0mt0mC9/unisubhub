import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Img,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface AccountConfirmationEmailProps {
  confirmation_link: string;
  user_email: string;
}

export const AccountConfirmationEmail = ({
  confirmation_link,
  user_email,
}: AccountConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Bienvenue chez UniSubHub ! Confirmez votre compte pour commencer.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src="https://via.placeholder.com/150x50/4F46E5/FFFFFF?text=UniSubHub"
            width="150"
            height="50"
            alt="UniSubHub Logo"
            style={logo}
          />
        </Section>
        
        <Heading style={h1}>Bienvenue chez UniSubHub ! 🎉</Heading>
        
        <Text style={text}>
          Bonjour et bienvenue dans l'univers UniSubHub !
        </Text>
        
        <Text style={text}>
          Nous sommes ravis de vous compter parmi nous. Pour commencer à utiliser votre compte et profiter de toutes nos fonctionnalités, veuillez confirmer votre adresse e-mail en cliquant sur le bouton ci-dessous :
        </Text>
        
        <Section style={buttonSection}>
          <Link
            href={confirmation_link}
            style={button}
          >
            Confirmer mon compte
          </Link>
        </Section>
        
        <Text style={text}>
          Une fois votre compte confirmé, vous pourrez :
        </Text>
        
        <Text style={listItem}>• 📊 Gérer tous vos abonnements en un seul endroit</Text>
        <Text style={listItem}>• 💰 Suivre vos dépenses mensuelles</Text>
        <Text style={listItem}>• 🔔 Recevoir des rappels avant les renouvellements</Text>
        <Text style={listItem}>• 📈 Analyser vos habitudes de consommation</Text>
        
        <Text style={text}>
          Si vous n'arrivez pas à cliquer sur le bouton, copiez et collez ce lien dans votre navigateur :
        </Text>
        
        <Text style={linkText}>
          {confirmation_link}
        </Text>
        
        <Text style={footerText}>
          Si vous n'avez pas créé de compte chez UniSubHub, vous pouvez ignorer cet e-mail.
        </Text>
        
        <Text style={footerText}>
          Merci de nous faire confiance,<br />
          L'équipe UniSubHub
        </Text>
      </Container>
    </Body>
  </Html>
);

export default AccountConfirmationEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const logoSection = {
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 20px',
  lineHeight: '1.3',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.4',
  margin: '16px 0',
  padding: '0 20px',
};

const listItem = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.4',
  margin: '8px 0',
  padding: '0 20px',
};

const buttonSection = {
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#4F46E5',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  lineHeight: '1.4',
};

const linkText = {
  color: '#4F46E5',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '16px 0',
  padding: '0 20px',
  wordBreak: 'break-all' as const,
};

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '16px 0',
  padding: '0 20px',
};