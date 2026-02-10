"use client";

import { use } from "react";
import { trpc } from "@/lib/trpc-client";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BracketView } from "@/components/tournament/bracket-view";
import {
  Trophy,
  Users,
  Calendar,
  Swords,
  Crown,
  Loader2,
  ArrowLeft,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  UPCOMING: "border-muted-foreground/30 text-muted-foreground",
  REGISTRATION_OPEN: "border-cyber-green/30 text-cyber-green",
  IN_PROGRESS: "border-electric-blue/30 text-electric-blue",
  COMPLETED: "border-neon-orange/30 text-neon-orange",
  CANCELLED: "border-destructive/30 text-destructive",
};

const participantStatusColors: Record<string, string> = {
  REGISTERED: "text-muted-foreground",
  ACTIVE: "text-cyber-green",
  ELIMINATED: "text-destructive",
  DISQUALIFIED: "text-destructive",
};

export default function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: tournament, isLoading } = trpc.tournament.get.useQuery({ id });
  const { data: registration } = trpc.tournament.isRegistered.useQuery(
    { tournamentId: id },
    { enabled: !!userId }
  );
  const utils = trpc.useUtils();

  const registerMutation = trpc.tournament.register.useMutation({
    onSuccess: () => {
      toast.success("Registered!");
      utils.tournament.get.invalidate({ id });
      utils.tournament.isRegistered.invalidate({ tournamentId: id });
    },
    onError: (err) => toast.error(err.message),
  });

  const unregisterMutation = trpc.tournament.unregister.useMutation({
    onSuccess: () => {
      toast.success("Unregistered");
      utils.tournament.get.invalidate({ id });
      utils.tournament.isRegistered.invalidate({ tournamentId: id });
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 rounded bg-bg-secondary border border-af-border animate-pulse" />
        <div className="h-48 w-full rounded-[14px] bg-bg-secondary border border-af-border animate-pulse" />
        <div className="h-96 w-full rounded-[14px] bg-bg-secondary border border-af-border animate-pulse" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-af-border rounded-[14px]">
        <p className="text-muted-foreground">Tournament not found.</p>
      </div>
    );
  }

  const canRegister =
    tournament.status === "REGISTRATION_OPEN" &&
    !registration &&
    tournament._count.tournament_participants < tournament.max_participants;

  const canUnregister =
    tournament.status === "REGISTRATION_OPEN" && !!registration;

  const isCreator = tournament.creator_id === userId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/tournaments"
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-bg-tertiary border border-af-border text-foreground hover:border-electric-blue hover:text-electric-blue transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-[24px] font-extrabold text-foreground flex items-center gap-2">
              <Trophy className="h-6 w-6 text-neon-orange" />
              {tournament.name}
            </h1>
            <span
              className={`inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold border ${statusColors[tournament.status] ?? ""}`}
            >
              {tournament.status.replace(/_/g, " ")}
            </span>
          </div>
          {tournament.description && (
            <p className="text-[13px] text-text-secondary ml-12">
              {tournament.description}
            </p>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          {canRegister && (
            <button
              onClick={() => registerMutation.mutate({ tournamentId: id })}
              disabled={registerMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-cyber-green text-black font-bold text-sm hover:bg-cyber-green/90 transition-colors disabled:opacity-50"
            >
              {registerMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              Register
              {tournament.entry_fee && tournament.entry_fee > 0
                ? ` (${tournament.entry_fee} coins)`
                : ""}
            </button>
          )}
          {canUnregister && (
            <button
              onClick={() => unregisterMutation.mutate({ tournamentId: id })}
              disabled={unregisterMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-bg-tertiary border border-af-border text-foreground font-semibold text-sm hover:border-electric-blue hover:text-electric-blue transition-all disabled:opacity-50"
            >
              {unregisterMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Withdraw
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {tournament._count.tournament_participants}/{tournament.max_participants}{" "}
          participants
        </span>
        <span className="flex items-center gap-1.5">
          <Swords className="h-4 w-4" />
          Round {tournament.current_round}/{tournament.total_rounds}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {new Date(tournament.start_date).toLocaleDateString()}
        </span>
        {tournament.prize_pool && tournament.prize_pool > 0 && (
          <span className="flex items-center gap-1.5 text-neon-orange">
            <Coins className="h-4 w-4" />
            {tournament.prize_pool} prize pool
          </span>
        )}
        {tournament.users_tournaments_winner_idTousers && (
          <span className="flex items-center gap-1.5 text-neon-orange">
            <Crown className="h-4 w-4" />
            Winner: {tournament.users_tournaments_winner_idTousers.username}
          </span>
        )}
        <span>
          Created by{" "}
          <Link
            href={`/${tournament.users_tournaments_creator_idTousers.username}`}
            className="text-electric-blue hover:underline"
          >
            {tournament.users_tournaments_creator_idTousers.username}
          </Link>
          {isCreator && (
            <span className="inline-flex ml-1 px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold border border-af-border text-muted-foreground">
              You
            </span>
          )}
        </span>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bracket">
        <TabsList>
          <TabsTrigger value="bracket">Bracket</TabsTrigger>
          <TabsTrigger value="participants">
            Participants ({tournament._count.tournament_participants})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bracket" className="mt-4">
          <BracketView
            rounds={tournament.tournament_rounds}
            totalRounds={tournament.total_rounds}
          />
        </TabsContent>

        <TabsContent value="participants" className="mt-4">
          <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
            <div className="grid grid-cols-12 gap-2 border-b border-af-border bg-bg-tertiary px-4 py-2 text-xs font-medium text-muted-foreground">
              <div className="col-span-1 text-center">Seed</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-2 text-center">ELO</div>
              <div className="col-span-2 text-center">W/L</div>
              <div className="col-span-2 text-center">Status</div>
            </div>
            {tournament.tournament_participants.map((p) => (
              <Link
                key={p.id}
                href={`/${p.users.username}`}
                className="grid grid-cols-12 items-center gap-2 px-4 py-3 hover:bg-bg-tertiary transition-colors border-b border-af-border last:border-0"
              >
                <div className="col-span-1 text-center text-sm text-muted-foreground">
                  {p.seed ?? "-"}
                </div>
                <div className="col-span-5 flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[8px]">
                      {p.users.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">{p.users.username}</span>
                  {p.user_id === userId && (
                    <span className="inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold border border-af-border text-muted-foreground">
                      You
                    </span>
                  )}
                </div>
                <div className="col-span-2 text-center text-sm text-electric-blue font-medium">
                  {p.elo_at_start}
                </div>
                <div className="col-span-2 text-center text-xs text-muted-foreground">
                  {p.wins}/{p.losses}
                </div>
                <div className="col-span-2 text-center">
                  <span
                    className={`text-xs font-medium ${participantStatusColors[p.status] ?? ""}`}
                  >
                    {p.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
