import { Metadata } from "next";
import { prisma } from "@/server/db/prisma";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const debate = await prisma.debates.findUnique({
    where: { slug },
    select: { topic: true, description: true, category: true },
  });

  if (!debate) return { title: "Debate Not Found" };

  return {
    title: debate.topic,
    description: debate.description ?? `A ${debate.category} debate on ArguFight`,
    openGraph: {
      title: debate.topic,
      description: debate.description ?? `A ${debate.category} debate on ArguFight`,
    },
  };
}

export default async function PublicDebatePage({ params }: PageProps) {
  const { slug } = await params;

  const debate = await prisma.debates.findUnique({
    where: { slug },
    select: {
      id: true,
      visibility: true,
      status: true,
    },
  });

  if (!debate) notFound();

  if (debate.visibility === "PRIVATE") {
    notFound();
  }

  // Redirect to the authenticated debate view
  redirect(`/debate/${debate.id}`);
}
