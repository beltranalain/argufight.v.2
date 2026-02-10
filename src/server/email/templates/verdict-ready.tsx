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

interface VerdictReadyEmailProps {
  username: string;
  debateTopic: string;
  debateUrl: string;
  result: "won" | "lost" | "tied";
}

export function VerdictReadyEmail({
  username,
  debateTopic,
  debateUrl,
  result,
}: VerdictReadyEmailProps) {
  const resultText =
    result === "won"
      ? "Congratulations! You won!"
      : result === "lost"
        ? "The AI judges ruled in favor of your opponent."
        : "It&apos;s a tie!";

  const resultColor =
    result === "won" ? "#00ff94" : result === "lost" ? "#ff006e" : "#00d9ff";

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Verdict Is In!</Heading>
          <Text style={text}>
            Hey {username}, the AI judges have reached a verdict on your debate:
          </Text>
          <Text
            style={{
              ...text,
              fontWeight: "600",
              fontSize: "16px",
              textAlign: "center" as const,
            }}
          >
            &ldquo;{debateTopic}&rdquo;
          </Text>
          <Text
            style={{
              ...text,
              color: resultColor,
              fontWeight: "700",
              fontSize: "20px",
              textAlign: "center" as const,
            }}
          >
            {resultText}
          </Text>
          <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
            <Button href={debateUrl} style={button}>
              View Full Verdict
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
