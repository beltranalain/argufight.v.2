"use client";

import { use, useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BeltHistory } from "@/components/belt/belt-history";
import { ChallengeModal } from "@/components/belt/challenge-modal";
import {
  Award,
  Shield,
  Crown,
  Swords,
  ArrowLeft,
  Calendar,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";

const typeIcons: Record<string, typeof Award> = {
  ROOKIE: Shield,
  CATEGORY: Award,
  CHAMPIONSHIP: Crown,
  UNDEFEATED: Swords,
  TOURNAMENT: Crown,
};

const typeColors: Record<string, string> = {
  ROOKIE: "border-cyber-green/30 text-cyber-green",
  CATEGORY: "border-electric-blue/30 text-electric-blue",
  CHAMPIONSHIP: "border-neon-orange/30 text-neon-orange",
  UNDEFEATED: "border-hot-pink/30 text-hot-pink",
  TOURNAMENT: "border-yellow-400/30 text-yellow-400",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-cyber-green/10 text-cyber-green border-cyber-green/30",
  INACTIVE: "bg-muted text-muted-foreground border-border",
  VACANT: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
  STAKED: "bg-neon-orange/10 text-neon-orange border-neon-orange/30",
  GRACE_PERIOD: "bg-electric-blue/10 text-electric-blue border-electric-blue/30",
  MANDATORY: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function BeltDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [challengeOpen, setChallengeOpen] = useState(false);

  const { data: belt, isLoading } = trpc.belt.get.useQuery({ id });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!belt) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Belt not found.</p>
      </div>
    );
  }

  const Icon = typeIcons[belt.type] ?? Award;
  const isHolder = belt.current_holder_id === userId;
  const canChallenge =
    !isHolder &&
    belt.current_holder_id &&
    ["ACTIVE", "MANDATORY", "GRACE_PERIOD"].includes(belt.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/belts/room">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className={`rounded-lg p-2.5 border ${typeColors[belt.type] ?? "border-border"}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{belt.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className={`text-[10px] ${typeColors[belt.type] ?? ""}`}>
                  {belt.type}
                </Badge>
                {belt.category && (
                  <Badge variant="outline" className="text-[10px]">
                    {belt.category}
                  </Badge>
                )}
                <Badge variant="outline" className={`text-[10px] ${statusColors[belt.status] ?? ""}`}>
                  {belt.status.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {canChallenge && (
          <Button
            onClick={() => setChallengeOpen(true)}
            className="bg-neon-orange text-black hover:bg-neon-orange/90"
          >
            <Swords className="mr-2 h-4 w-4" />
            Challenge
          </Button>
        )}
        {isHolder && (
          <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/30">
            You hold this belt
          </Badge>
        )}
      </div>

      {/* Current holder card */}
      <div className="rounded-xl border border-border/50 bg-card/80 p-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Current Holder
        </h2>
        {belt.users ? (
          <div className="flex items-center justify-between">
            <Link
              href={`/${belt.users.username}`}
              className="flex items-center gap-3 hover:opacity-80"
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-sm">
                  {belt.users.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{belt.users.username}</p>
                <p className="text-sm text-muted-foreground">
                  ELO {belt.users.elo_rating}
                </p>
              </div>
            </Link>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-lg font-bold text-cyber-green">
                  {belt.successful_defenses}
                </p>
                <p className="text-[10px] text-muted-foreground">Defenses</p>
              </div>
              <div>
                <p className="text-lg font-bold">{belt.total_days_held}</p>
                <p className="text-[10px] text-muted-foreground">Days Held</p>
              </div>
              <div>
                <p className="text-lg font-bold text-neon-orange">
                  {belt.coin_value}
                </p>
                <p className="text-[10px] text-muted-foreground">Coin Value</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            This belt is vacant. Win a qualifying debate to claim it!
          </p>
        )}

        {/* Dates */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/30 text-xs text-muted-foreground">
          {belt.acquired_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Acquired {formatDistanceToNow(belt.acquired_at)}
            </span>
          )}
          {belt.last_defended_at && (
            <span>Last defended {formatDistanceToNow(belt.last_defended_at)}</span>
          )}
          {belt.next_defense_due && (
            <span className="text-neon-orange">
              Defense due {new Date(belt.next_defense_due).toLocaleDateString()}
            </span>
          )}
          {belt.grace_period_ends && (
            <span className="text-electric-blue">
              Grace period ends{" "}
              {new Date(belt.grace_period_ends).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Active challenges */}
      {belt.belt_challenges.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card/80 p-5">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Active Challenges
          </h2>
          <div className="space-y-2">
            {belt.belt_challenges.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/30"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[8px]">
                      {c.users_belt_challenges_challenger_idTousers.username
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-sm font-medium">
                      {c.users_belt_challenges_challenger_idTousers.username}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ELO {c.users_belt_challenges_challenger_idTousers.elo_rating}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.entry_fee > 0 && (
                    <span className="text-xs text-neon-orange flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      {c.entry_fee}
                    </span>
                  )}
                  <Badge variant="outline" className="text-[10px]">
                    {c.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    expires {formatDistanceToNow(c.expires_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs: History */}
      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">
            Transfer History ({belt._count.belt_history})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="mt-4">
          <BeltHistory beltId={id} />
        </TabsContent>
      </Tabs>

      {/* Challenge Modal */}
      {canChallenge && (
        <ChallengeModal
          open={challengeOpen}
          onOpenChange={setChallengeOpen}
          belt={{
            id: belt.id,
            name: belt.name,
            type: belt.type,
            category: belt.category,
            users: belt.users,
          }}
        />
      )}
    </div>
  );
}
