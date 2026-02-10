"use client";

import { use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StatementEditor } from "@/components/debate/statement-editor";
import { VerdictDisplay } from "@/components/debate/verdict-display";
import { DebateInteractions } from "@/components/debate/debate-interactions";
import { CommentsSection } from "@/components/debate/comments-section";
import { LiveChat } from "@/components/debate/live-chat";
import {
  Swords,
  Clock,
  Users,
  Eye,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<string, { label: string; color: string; dotColor?: string }> = {
  WAITING: { label: "Waiting for Opponent", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  ACTIVE: { label: "LIVE", color: "bg-cyber-green/15 text-cyber-green border-cyber-green/30", dotColor: "bg-cyber-green" },
  COMPLETED: { label: "Completed", color: "bg-muted text-muted-foreground border-af-border" },
  VERDICT_READY: { label: "Verdict Ready", color: "bg-cyber-green/20 text-cyber-green border-cyber-green/30" },
  APPEALED: { label: "Appealed", color: "bg-neon-orange/20 text-neon-orange border-neon-orange/30" },
  CANCELLED: { label: "Cancelled", color: "bg-destructive/20 text-destructive border-destructive/30" },
};

export default function DebateDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: session } = useSession();
  const userId = session?.user?.id as string | undefined;

  const { data: debate, isLoading } = trpc.debate.get.useQuery({ id });
  const { data: verdictData } = trpc.debate.get.useQuery(
    { id },
    { enabled: !!debate && (debate.status === "VERDICT_READY" || debate.status === "COMPLETED" || debate.status === "APPEALED") }
  );

  const { data: interactionStatus } = trpc.debate.interactionStatus.useQuery(
    { debateId: id },
    { enabled: !!userId }
  );

  const utils = trpc.useUtils();

  const acceptMutation = trpc.debate.accept.useMutation({
    onSuccess: () => {
      toast.success("Debate accepted! Game on!");
      utils.debate.get.invalidate({ id });
    },
    onError: (err) => toast.error(err.message),
  });

  const submitMutation = trpc.debate.submitStatement.useMutation({
    onSuccess: () => {
      toast.success("Argument submitted!");
      utils.debate.get.invalidate({ id });
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return <DebateDetailSkeleton />;
  }

  if (!debate) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <p className="mt-3 font-medium">Debate not found</p>
      </div>
    );
  }

  const challenger = debate.users_debates_challenger_idTousers;
  const opponent = debate.users_debates_opponent_idTousers;
  const isChallenger = userId === challenger.id;
  const isOpponent = userId === opponent?.id;
  const isParticipant = isChallenger || isOpponent;
  const status = statusConfig[debate.status] ?? statusConfig.CANCELLED;

  // Group statements by round
  const statementsByRound: Record<number, typeof debate.statements> = {};
  for (const stmt of debate.statements) {
    if (!statementsByRound[stmt.round]) statementsByRound[stmt.round] = [];
    statementsByRound[stmt.round].push(stmt);
  }

  // Check if current user has submitted for current round
  const currentRoundStatements = statementsByRound[debate.current_round] ?? [];
  const userSubmittedThisRound = currentRoundStatements.some(
    (s) => s.author_id === userId
  );

  const canAccept =
    debate.status === "WAITING" &&
    !isChallenger &&
    (!debate.opponent_id || isOpponent);

  const canSubmit =
    debate.status === "ACTIVE" && isParticipant && !userSubmittedThisRound;

  const handleSubmitStatement = async (content: string) => {
    submitMutation.mutate({
      debateId: debate.id,
      content,
      round: debate.current_round,
    });
  };

  return (
    <div className="px-4 md:px-6 py-4 max-w-[1280px] mx-auto">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-af-border bg-transparent text-text-secondary text-sm font-medium hover:bg-bg-tertiary hover:text-foreground transition-all mb-5"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">

        {/* ===== MAIN COLUMN ===== */}
        <div className="flex flex-col gap-6 min-w-0">

          {/* Debate Info Card */}
          <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
            <div className="p-6 pb-0">
              {/* Status + Category */}
              <div className="flex items-center gap-2.5 mb-3">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-electric-blue/15 text-electric-blue">
                  {debate.category}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border ${status.color}`}>
                  {status.dotColor && (
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} animate-pulse`} />
                  )}
                  {status.label}
                </span>
              </div>

              {/* Topic */}
              <h1 className="text-[28px] font-extrabold text-foreground leading-tight mb-2">
                {debate.topic}
              </h1>
              {debate.description && (
                <p className="text-sm text-text-secondary leading-relaxed">
                  {debate.description}
                </p>
              )}

              {/* Interactions Bar */}
              <div className="flex items-center gap-4 pt-4 mt-4 border-t border-af-border">
                <DebateInteractions
                  debateId={debate.id}
                  initialLiked={interactionStatus?.liked}
                  initialSaved={interactionStatus?.saved}
                  likeCount={debate._count.debate_likes}
                  saveCount={debate._count.debate_saves}
                  slug={debate.slug}
                />
              </div>
            </div>

            <div className="p-6">
              {/* Participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-electric-blue/20 text-electric-blue font-bold">
                      {challenger.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-[15px] font-semibold text-foreground">{challenger.username}</p>
                    <p className="text-[13px] text-text-secondary">ELO: {challenger.elo_rating ?? 1200}</p>
                    <span className="inline-flex mt-1 px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-bg-tertiary text-text-secondary">
                      {debate.challenger_position}
                    </span>
                  </div>
                </div>

                {opponent ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-neon-orange/20 text-neon-orange font-bold">
                        {opponent.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[15px] font-semibold text-foreground">{opponent.username}</p>
                      <p className="text-[13px] text-text-secondary">ELO: {opponent.elo_rating ?? 1200}</p>
                      <span className="inline-flex mt-1 px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-bg-tertiary text-text-secondary">
                        {debate.opponent_position}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center text-muted-foreground text-lg">
                      ?
                    </div>
                    <div>
                      <p className="text-sm italic text-muted-foreground">
                        Waiting for opponent...
                      </p>
                      {canAccept && (
                        <Button
                          size="sm"
                          className="mt-2 bg-cyber-green text-black hover:bg-cyber-green/90"
                          onClick={() => acceptMutation.mutate({ debateId: debate.id })}
                          disabled={acceptMutation.isPending}
                        >
                          {acceptMutation.isPending ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : null}
                          Accept Challenge
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress / Stats */}
              <div className="pt-5 mt-5 border-t border-af-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">
                    Round {debate.current_round} of {debate.total_rounds}
                  </span>
                  {debate.round_deadline && debate.status === "ACTIVE" && (
                    <span className="text-sm font-semibold text-electric-blue">
                      {formatDistanceToNow(debate.round_deadline)} left
                    </span>
                  )}
                </div>
                <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-electric-blue rounded-full transition-all duration-500"
                    style={{ width: `${(debate.current_round / debate.total_rounds) * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {debate.view_count} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {debate.spectator_count} spectators
                  </span>
                  {debate.has_belt_at_stake && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Shield className="h-3.5 w-3.5" /> Belt at Stake
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Arguments Card */}
          <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
            <div className="p-6 pb-0">
              <h2 className="text-xl font-bold text-foreground">Arguments</h2>
            </div>
            <div className="p-6">
              {Array.from({ length: debate.current_round }, (_, i) => i + 1).map(
                (round) => {
                  const roundStmts = statementsByRound[round] ?? [];
                  const challengerStmt = roundStmts.find(
                    (s) => s.author_id === challenger.id
                  );
                  const opponentStmt = roundStmts.find(
                    (s) => s.author_id === opponent?.id
                  );

                  return (
                    <div
                      key={round}
                      className={`pb-6 mb-6 ${round < debate.current_round ? "border-b border-af-border" : ""}`}
                    >
                      <h3 className="text-lg font-bold text-foreground mb-4">
                        Round {round}
                      </h3>

                      {/* Challenger Statement */}
                      <div className="af-statement-challenger mb-3">
                        <div className="flex items-center gap-2.5 mb-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-[11px] bg-electric-blue/20 text-electric-blue font-bold">
                              {challenger.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-semibold text-foreground">
                            {challenger.username}
                          </span>
                        </div>
                        {challengerStmt ? (
                          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {challengerStmt.content}
                          </p>
                        ) : (
                          <p className="text-sm italic text-muted-foreground">
                            {round === debate.current_round ? "Not yet submitted..." : "No statement"}
                          </p>
                        )}
                      </div>

                      {/* Opponent Statement */}
                      <div className="af-statement-opponent">
                        <div className="flex items-center gap-2.5 mb-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-[11px] bg-neon-orange/20 text-neon-orange font-bold">
                              {opponent ? opponent.username.slice(0, 2).toUpperCase() : "??"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-semibold text-foreground">
                            {opponent?.username ?? "Opponent"}
                          </span>
                        </div>
                        {opponentStmt ? (
                          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {opponentStmt.content}
                          </p>
                        ) : (
                          <p className="text-sm italic text-muted-foreground">
                            {round === debate.current_round ? "Not yet submitted..." : "No statement"}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }
              )}

              {/* Statement editor */}
              {canSubmit && (
                <StatementEditor
                  onSubmit={handleSubmitStatement}
                  round={debate.current_round}
                  allowCopyPaste={debate.allow_copy_paste}
                  disabled={submitMutation.isPending}
                />
              )}

              {userSubmittedThisRound && debate.status === "ACTIVE" && (
                <div className="flex items-center justify-center gap-2 rounded-[12px] border border-cyber-green/20 bg-cyber-green/5 p-4">
                  <CheckCircle2 className="h-4 w-4 text-cyber-green" />
                  <span className="text-sm text-cyber-green">
                    You&apos;ve submitted your argument for Round {debate.current_round}.
                    Waiting for opponent...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Verdict Card */}
          <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
            <div className="p-6 pb-0">
              <h2 className="text-[22px] font-extrabold text-foreground">AI Judge Verdicts</h2>
            </div>
            <div className="p-6">
              {debate.verdicts && debate.verdicts.length > 0 ? (
                <VerdictDisplay
                  verdicts={debate.verdicts as never}
                  summary={null}
                  challengerName={challenger.username}
                  opponentName={opponent?.username ?? "Opponent"}
                />
              ) : (
                <VerdictDisplay
                  verdicts={[]}
                  summary={null}
                  challengerName={challenger.username}
                  opponentName={opponent?.username ?? "Opponent"}
                />
              )}
            </div>
          </div>
        </div>

        {/* ===== SIDEBAR COLUMN ===== */}
        <div className="flex flex-col gap-6 min-w-0">
          {/* Live Chat */}
          <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
            <div className="p-4 pb-0">
              <h2 className="text-xl font-bold text-foreground">Live Chat</h2>
              <p className="text-[13px] text-text-secondary mt-1">Chat with everyone watching this debate</p>
            </div>
            <div className="h-[500px]">
              <LiveChat debateId={debate.id} />
            </div>
          </div>

          {/* Comments */}
          <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
            <div className="p-4 pb-0">
              <h2 className="text-xl font-bold text-foreground">
                Comments ({debate._count.debate_comments})
              </h2>
              <p className="text-[13px] text-text-secondary mt-1">Discuss this debate</p>
            </div>
            <div className="h-[600px]">
              <CommentsSection debateId={debate.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DebateDetailSkeleton() {
  return (
    <div className="px-4 md:px-6 py-4 max-w-[1280px] mx-auto">
      <Skeleton className="h-10 w-20 mb-5" />
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="flex flex-col gap-6">
          <div className="bg-bg-secondary border border-af-border rounded-[14px] p-6">
            <Skeleton className="h-5 w-24 mb-3" />
            <Skeleton className="h-8 w-2/3 mb-2" />
            <Skeleton className="h-4 w-full mb-6" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-1 h-3 w-16" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-1 h-3 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </div>
          </div>
          <div className="bg-bg-secondary border border-af-border rounded-[14px] p-6">
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-[500px] rounded-[14px]" />
          <Skeleton className="h-[600px] rounded-[14px]" />
        </div>
      </div>
    </div>
  );
}
