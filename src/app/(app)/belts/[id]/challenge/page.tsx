"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc-client";
import { useSession } from "next-auth/react";
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
        <div className="h-8 w-64 rounded bg-bg-secondary border border-af-border animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 w-full rounded-[14px] bg-bg-secondary border border-af-border animate-pulse" />
        ))}
      </div>
    );
  }

  // Filter to challenges for this belt
  const beltChallenges = (challenges ?? []).filter((c) => c.belt_id === beltId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/belts/${beltId}`}
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-bg-tertiary border border-af-border text-foreground hover:border-electric-blue hover:text-electric-blue transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-[24px] font-extrabold text-foreground flex items-center gap-2">
            <Swords className="h-6 w-6 text-neon-orange" />
            Belt Challenges
          </h1>
          <p className="text-[13px] text-text-secondary">
            Manage incoming and outgoing challenges
          </p>
        </div>
      </div>

      {beltChallenges.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-af-border rounded-[14px]">
          <Swords className="mx-auto h-12 w-12 text-electric-blue opacity-60 mb-4" />
          <p className="text-base font-bold text-foreground">No active challenges for this belt.</p>
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
                className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold border border-af-border text-muted-foreground">
                      {isIncoming ? "Incoming" : "Outgoing"}
                    </span>
                    <span className="inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold border border-af-border text-muted-foreground">
                      {c.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {c.belts.name} ({c.belts.type})
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    expires {formatDistanceToNow(c.expires_at)}
                  </span>
                </div>

                {c.debate_topic && (
                  <p className="text-sm font-medium text-foreground mb-3">{c.debate_topic}</p>
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
                        <p className="text-sm font-medium text-foreground">{challenger.username}</p>
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
                        <p className="text-sm font-medium text-foreground">{holder.username}</p>
                        <p className="text-[10px] text-muted-foreground">
                          ELO {holder.elo_rating}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions for holder */}
                  {isIncoming && c.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          respondMutation.mutate({
                            challengeId: c.id,
                            response: "ACCEPTED",
                          })
                        }
                        disabled={respondMutation.isPending}
                        className="inline-flex items-center justify-center h-9 w-9 rounded-[10px] bg-cyber-green text-black font-bold hover:bg-cyber-green/90 transition-colors disabled:opacity-50"
                      >
                        {respondMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          respondMutation.mutate({
                            challengeId: c.id,
                            response: "DECLINED",
                          })
                        }
                        disabled={respondMutation.isPending}
                        className="inline-flex items-center justify-center h-9 w-9 rounded-[10px] bg-bg-tertiary border border-af-border text-foreground hover:border-electric-blue hover:text-electric-blue transition-all disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {c.debate_id && (
                    <Link
                      href={`/debate/${c.debate_id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-bg-tertiary border border-af-border text-foreground text-sm font-semibold hover:border-electric-blue hover:text-electric-blue transition-all"
                    >
                      View Debate
                    </Link>
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
