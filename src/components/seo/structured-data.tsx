interface StructuredDataProps {
  data: Record<string, unknown>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteStructuredData() {
  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "ArguFight",
        url: "https://argufight.com",
        description:
          "The premier AI-judged online debate platform. Challenge opponents, sharpen arguments, and earn rankings.",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://argufight.com/debates?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function OrganizationStructuredData() {
  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "ArguFight",
        url: "https://argufight.com",
        logo: "https://argufight.com/images/logo.png",
        sameAs: [],
      }}
    />
  );
}

export function BlogPostStructuredData({
  title,
  description,
  slug,
  authorName,
  publishedAt,
  imageUrl,
}: {
  title: string;
  description: string;
  slug: string;
  authorName: string;
  publishedAt: string;
  imageUrl?: string;
}) {
  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description,
        url: `https://argufight.com/blog/${slug}`,
        datePublished: publishedAt,
        author: {
          "@type": "Person",
          name: authorName,
        },
        publisher: {
          "@type": "Organization",
          name: "ArguFight",
          logo: { "@type": "ImageObject", url: "https://argufight.com/images/logo.png" },
        },
        ...(imageUrl ? { image: imageUrl } : {}),
      }}
    />
  );
}

export function DebateStructuredData({
  title,
  description,
  slug,
  challenger,
  opponent,
  status,
}: {
  title: string;
  description: string;
  slug: string;
  challenger: string;
  opponent: string;
  status: string;
}) {
  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "Event",
        name: title,
        description,
        url: `https://argufight.com/debates/${slug}`,
        eventStatus:
          status === "VERDICT_REACHED"
            ? "https://schema.org/EventScheduled"
            : "https://schema.org/EventMovedOnline",
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        performer: [
          { "@type": "Person", name: challenger },
          { "@type": "Person", name: opponent },
        ],
        organizer: {
          "@type": "Organization",
          name: "ArguFight",
          url: "https://argufight.com",
        },
      }}
    />
  );
}
