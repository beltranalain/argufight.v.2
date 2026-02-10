"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc-client";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Swords, ArrowLeft, Loader2, Check, X } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";
import { toast } from "sonner";

export default function BeltChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: beltId } = use(params);
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: challenges, isLoading } = trpc.belt.activeChallenges.useQuery();

  const respondMutation = trpc.belt.respondToChallenge.useMutation({
    onSuccess: (result) => {
      if (result.status === "ACCEPTED" && result.debateId) {
        toast.success("Challenge accepted! Debate created.");
        router.push(`/debate/${result.debateId}`);
      } else {
        toast.success("Challenge declined.");
        utils.belt.activeChallenges.invalidate();
      }
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  // Filter to challenges for this belt
  const beltChallenges = (challenges ?? []).filter((c) => c.belt_id === beltId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/belts/${beltId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Swords className="h-6 w-6 text-neon-orange" />
            Belt Challenges
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage incoming and outgoing challenges
          </p>
        </div>
      </div>

      {beltChallenges.length === 0 ? (
        <div className="py-16 text-center">
          <Swords className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No active challenges for this belt.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {beltChallenges.map((c) => {
            const isIncoming = c.belt_holder_id === userId;
            const challenger = c.users_belt_challenges_challenger_idTousers;
            const holder = c.users_belt_challenges_belt_holder_idTousers;

            return (
              <div
                key={c.id}
                className="rounded-xl border border-border/50 bg-card/80 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {isIncoming ? "Incoming" : "Outgoing"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {c.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {c.belts.name} ({c.belts.type})
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    expires {formatDistanceToNow(c.expires_at)}
                  </span>
                </div>

                {c.debate_topic && (
                  <p className="text-sm font-medium mb-3">{c.debate_topic}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-[8px]">
                          {challenger.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{challenger.username}</p>
                        <p className="text-[10px] text-muted-foreground">
                          ELO {challenger.elo_rating}
                        </p>
                      </div>
                    </div>
                    <Swords className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-[8px]">
                          {holder.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{holder.username}</p>
                        <p className="text-[10px] text-muted-foreground">
                          ELO {holder.elo_rating}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions for holder */}
                  {isIncoming && c.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          respondMutation.mutate({
                            challengeId: c.id,
                            response: "ACCEPTED",
                          })
                        }
                        disabled={respondMutation.isPending}
                        className="bg-cyber-green text-black hover:bg-cyber-green/90"
                      >
                        {respondMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          respondMutation.mutate({
                            challengeId: c.id,
                            response: "DECLINED",
                          })
                        }
                        disabled={respondMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {c.debate_id && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/debate/${c.debate_id}`}>View Debate</Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
