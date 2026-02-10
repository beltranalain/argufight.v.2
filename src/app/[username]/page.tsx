import { Metadata } from "next";
import { prisma } from "@/server/db/prisma";
import { notFound } from "next/navigation";
import { PublicProfile } from "@/components/profile/public-profile";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.users.findUnique({
    where: { username },
    select: { username: true, bio: true, elo_rating: true },
  });

  if (!user) return { title: "User Not Found" };

  return {
    title: `${user.username} — ArguFight Profile`,
    description: user.bio ?? `${user.username} on ArguFight — ELO ${user.elo_rating}`,
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;

  const user = await prisma.users.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      avatar_url: true,
      bio: true,
      elo_rating: true,
      total_debates: true,
      debates_won: true,
      debates_lost: true,
      debates_tied: true,
      coins: true,
      is_creator: true,
      total_belt_defenses: true,
      current_belts_count: true,
      total_belt_wins: true,
      follower_count: true,
      created_at: true,
      is_banned: true,
      _count: {
        select: {
          follows_follows_follower_idTousers: true,
        },
      },
    },
  });

  if (!user || user.is_banned) notFound();

  return <PublicProfile user={user} />;
}
