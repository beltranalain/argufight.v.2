"use client";

import { use } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  WAITING: { label: "Waiting for Opponent", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  ACTIVE: { label: "Live", color: "bg-electric-blue/20 text-electric-blue border-electric-blue/30" },
  COMPLETED: { label: "Completed", color: "bg-muted text-muted-foreground border-border" },
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <Badge variant="outline" className={status.color}>
            {status.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {debate.category} &bull; {formatDistanceToNow(debate.created_at)}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold">{debate.topic}</h1>
        {debate.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {debate.description}
          </p>
        )}
      </div>

      {/* Participants bar */}
      <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/80 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-electric-blue/20 text-electric-blue">
              {challenger.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{challenger.username}</p>
            <p className="text-xs text-muted-foreground">
              {debate.challenger_position} &bull; ELO {challenger.elo_rating ?? 1200}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <Swords className="h-5 w-5 text-muted-foreground" />
          <span className="mt-1 text-xs text-muted-foreground">
            Round {debate.current_round}/{debate.total_rounds}
          </span>
        </div>

        {opponent ? (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-medium">{opponent.username}</p>
              <p className="text-xs text-muted-foreground">
                {debate.opponent_position} &bull; ELO {opponent.elo_rating ?? 1200}
              </p>
            </div>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-neon-orange/20 text-neon-orange">
                {opponent.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className="text-right">
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
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" /> {debate.view_count} views
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> {debate.spectator_count} spectators
        </span>
        {debate.round_deadline && debate.status === "ACTIVE" && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Deadline: {formatDistanceToNow(debate.round_deadline)}
          </span>
        )}
        {debate.has_belt_at_stake && (
          <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 text-[10px]">
            <Shield className="mr-1 h-3 w-3" /> Belt at Stake
          </Badge>
        )}
      </div>

      {/* Interactions */}
      <DebateInteractions
        debateId={debate.id}
        initialLiked={interactionStatus?.liked}
        initialSaved={interactionStatus?.saved}
        likeCount={debate._count.debate_likes}
        saveCount={debate._count.debate_saves}
        slug={debate.slug}
      />

      <Separator />

      {/* Main content tabs */}
      <Tabs defaultValue="arguments">
        <TabsList>
          <TabsTrigger value="arguments">Arguments</TabsTrigger>
          <TabsTrigger value="verdict">
            Verdict
            {debate.verdict_reached && (
              <CheckCircle2 className="ml-1 h-3 w-3 text-cyber-green" />
            )}
          </TabsTrigger>
          <TabsTrigger value="chat">
            Chat
          </TabsTrigger>
          <TabsTrigger value="comments">
            Comments ({debate._count.debate_comments})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arguments" className="mt-4 space-y-6">
          {/* Rounds display */}
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
                <div key={round}>
                  <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                    Round {round}
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Challenger statement */}
                    <div className="rounded-lg border border-electric-blue/20 bg-electric-blue/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[8px] bg-electric-blue/20 text-electric-blue">
                            {challenger.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">
                          {challenger.username}
                        </span>
                      </div>
                      {challengerStmt ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {challengerStmt.content}
                        </p>
                      ) : (
                        <p className="text-sm italic text-muted-foreground">
                          {round === debate.current_round
                            ? "Not yet submitted..."
                            : "No statement"}
                        </p>
                      )}
                    </div>

                    {/* Opponent statement */}
                    <div className="rounded-lg border border-neon-orange/20 bg-neon-orange/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[8px] bg-neon-orange/20 text-neon-orange">
                            {opponent
                              ? opponent.username.slice(0, 2).toUpperCase()
                              : "??"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">
                          {opponent?.username ?? "Opponent"}
                        </span>
                      </div>
                      {opponentStmt ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {opponentStmt.content}
                        </p>
                      ) : (
                        <p className="text-sm italic text-muted-foreground">
                          {round === debate.current_round
                            ? "Not yet submitted..."
                            : "No statement"}
                        </p>
                      )}
                    </div>
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
            <div className="flex items-center justify-center gap-2 rounded-lg border border-cyber-green/20 bg-cyber-green/5 p-4">
              <CheckCircle2 className="h-4 w-4 text-cyber-green" />
              <span className="text-sm text-cyber-green">
                You&apos;ve submitted your argument for Round {debate.current_round}.
                Waiting for opponent...
              </span>
            </div>
          )}
        </TabsContent>

        <TabsContent value="verdict" className="mt-4">
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
        </TabsContent>

        <TabsContent value="chat" className="mt-4">
          <LiveChat debateId={debate.id} />
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <CommentsSection debateId={debate.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DebateDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-3 h-8 w-2/3" />
        <Skeleton className="mt-2 h-4 w-full" />
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/80 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-1 h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-5 w-5" />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-1 h-3 w-16" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
