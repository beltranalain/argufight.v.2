import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Hr,
} from "@react-email/components";

interface PasswordResetEmailProps {
  username: string;
  resetUrl: string;
}

export function PasswordResetEmail({
  username,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Reset Your Password</Heading>
          <Text style={text}>
            Hey {username}, we received a request to reset your password. Click
            the button below to set a new one.
          </Text>
          <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
            <Button href={resetUrl} style={button}>
              Reset Password
            </Button>
          </Section>
          <Text style={text}>
            This link expires in 1 hour. If you didn&apos;t request this, you can
            safely ignore this email.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>ArguFight — Where Arguments Become Art</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#0a0a0a",
  fontFamily: "'Inter', -apple-system, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "32px 20px",
  maxWidth: "480px",
};

const heading = {
  color: "#00d9ff",
  fontSize: "28px",
  fontWeight: "700",
  textAlign: "center" as const,
};

const text = {
  color: "#e0e0e0",
  fontSize: "14px",
  lineHeight: "1.6",
};

const button = {
  backgroundColor: "#00d9ff",
  color: "#000",
  padding: "12px 28px",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "14px",
  textDecoration: "none",
};

const hr = {
  borderTop: "1px solid #333",
  margin: "24px 0",
};

const footer = {
  color: "#666",
  fontSize: "12px",
  textAlign: "center" as const,
};
