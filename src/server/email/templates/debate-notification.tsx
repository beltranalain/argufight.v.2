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

interface DebateNotificationEmailProps {
  username: string;
  type: "challenge" | "accepted" | "turn" | "round_ending";
  debateTopic: string;
  opponentName: string;
  debateUrl: string;
}

const typeConfig = {
  challenge: {
    title: "New Debate Challenge!",
    message: (opponent: string, topic: string) =>
      `${opponent} has challenged you to debate: "${topic}"`,
    cta: "View Challenge",
  },
  accepted: {
    title: "Challenge Accepted!",
    message: (opponent: string, topic: string) =>
      `${opponent} accepted your debate on "${topic}". Time to make your argument!`,
    cta: "Go to Debate",
  },
  turn: {
    title: "Your Turn!",
    message: (opponent: string, topic: string) =>
      `${opponent} has submitted their argument for "${topic}". It's your turn!`,
    cta: "Submit Your Argument",
  },
  round_ending: {
    title: "Round Ending Soon!",
    message: (_opponent: string, topic: string) =>
      `The current round for "${topic}" is ending soon. Don't forget to submit!`,
    cta: "Submit Now",
  },
};

export function DebateNotificationEmail({
  username,
  type,
  debateTopic,
  opponentName,
  debateUrl,
}: DebateNotificationEmailProps) {
  const config = typeConfig[type];

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>{config.title}</Heading>
          <Text style={text}>
            Hey {username}, {config.message(opponentName, debateTopic)}
          </Text>
          <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
            <Button href={debateUrl} style={button}>
              {config.cta}
            </Button>
          </Section>
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
