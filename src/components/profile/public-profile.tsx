"use client";

import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DebateCard } from "@/components/debate/debate-card";
import { DebateListSkeleton } from "@/components/skeletons/debate-card-skeleton";
import {
  Trophy,
  Swords,
  Shield,
  Users,
  Calendar,
  Loader2,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { toast } from "sonner";
import { useOptimistic } from "react";

interface PublicProfileProps {
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    bio: string | null;
    elo_rating: number;
    total_debates: number;
    debates_won: number;
    debates_lost: number;
    debates_tied: number;
    coins: number;
    is_creator: boolean;
    total_belt_defenses: number;
    current_belts_count: number;
    total_belt_wins: number;
    follower_count: number;
    created_at: Date;
    _count: { follows_follows_follower_idTousers: number };
  };
}

export function PublicProfile({ user }: PublicProfileProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id as string | undefined;
  const isOwnProfile = currentUserId === user.id;

  const { data: followStatus } = trpc.follow.isFollowing.useQuery(
    { userId: user.id },
    { enabled: !!currentUserId && !isOwnProfile }
  );

  const [optimisticFollowing, setOptimisticFollowing] = useOptimistic(
    followStatus?.following ?? false
  );

  const toggleFollow = trpc.follow.toggle.useMutation({
    onMutate: () => setOptimisticFollowing(!optimisticFollowing),
    onError: () => {
      setOptimisticFollowing(followStatus?.following ?? false);
      toast.error("Failed to update follow");
    },
  });

  const { data: debatesData, isLoading: debatesLoading } =
    trpc.debate.list.useInfiniteQuery(
      { userId: user.id, limit: 6, visibility: "PUBLIC" as never },
      { getNextPageParam: (p) => p.nextCursor }
    );

  const debates = debatesData?.pages.flatMap((p) => p.debates) ?? [];
  const winRate = user.total_debates > 0
    ? Math.round((user.debates_won / user.total_debates) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Profile header */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.avatar_url ?? undefined} />
          <AvatarFallback className="text-2xl bg-electric-blue/20 text-electric-blue">
            {user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-2xl font-bold">{user.username}</h1>
            {user.is_creator && (
              <Badge className="bg-cyber-green/20 text-cyber-green border-cyber-green/30">
                Creator
              </Badge>
            )}
          </div>
          {user.bio && (
            <p className="mt-1 text-sm text-muted-foreground">{user.bio}</p>
          )}
          <div className="mt-2 flex items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {user.follower_count} followers
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {user._count.follows_follows_follower_idTousers} following
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Joined {formatDistanceToNow(user.created_at)}
            </span>
          </div>

          {!isOwnProfile && currentUserId && (
            <Button
              className={`mt-3 ${
                optimisticFollowing
                  ? ""
                  : "bg-electric-blue text-black hover:bg-electric-blue/90"
              }`}
              variant={optimisticFollowing ? "outline" : "default"}
              size="sm"
              onClick={() => toggleFollow.mutate({ userId: user.id })}
              disabled={toggleFollow.isPending}
            >
              {toggleFollow.isPending ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : optimisticFollowing ? (
                <UserMinus className="mr-1 h-3 w-3" />
              ) : (
                <UserPlus className="mr-1 h-3 w-3" />
              )}
              {optimisticFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-electric-blue">{user.elo_rating}</p>
            <p className="text-xs text-muted-foreground">ELO Rating</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{user.total_debates}</p>
            <p className="text-xs text-muted-foreground">Debates</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-cyber-green">{winRate}%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{user.current_belts_count}</p>
            <p className="text-xs text-muted-foreground">Belts Held</p>
          </CardContent>
        </Card>
      </div>

      {/* W/L/T breakdown */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <span className="flex items-center gap-1">
          <Trophy className="h-4 w-4 text-cyber-green" />
          {user.debates_won} wins
        </span>
        <span className="flex items-center gap-1">
          <Swords className="h-4 w-4 text-destructive" />
          {user.debates_lost} losses
        </span>
        <span className="flex items-center gap-1">
          <Shield className="h-4 w-4 text-muted-foreground" />
          {user.debates_tied} ties
        </span>
      </div>

      <Separator className="my-6" />

      {/* Debates tab */}
      <Tabs defaultValue="debates">
        <TabsList>
          <TabsTrigger value="debates">Recent Debates</TabsTrigger>
        </TabsList>
        <TabsContent value="debates" className="mt-4">
          {debatesLoading ? (
            <DebateListSkeleton count={3} />
          ) : debates.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No public debates yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {debates.map((d) => (
                <DebateCard key={d.id} debate={d} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
