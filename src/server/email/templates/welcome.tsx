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

interface WelcomeEmailProps {
  username: string;
  appUrl?: string;
}

export function WelcomeEmail({
  username,
  appUrl = "https://argufight.com",
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Welcome to ArguFight!</Heading>
          <Text style={text}>
            Hey {username}, welcome to the arena! Your account has been created
            and you&apos;re ready to start debating.
          </Text>
          <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
            <Button
              href={`${appUrl}/dashboard`}
              style={button}
            >
              Start Your First Debate
            </Button>
          </Section>
          <Text style={text}>
            Here&apos;s what you can do:
          </Text>
          <Text style={text}>
            - Challenge anyone to a structured debate{"\n"}
            - Get judged by 7 AI judges with unique personalities{"\n"}
            - Climb the ELO leaderboard{"\n"}
            - Compete in tournaments and belt championships{"\n"}
            - Earn coins and unlock achievements
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
