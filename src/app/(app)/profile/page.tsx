"use client";

import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DebateCard } from "@/components/debate/debate-card";
import { DebateListSkeleton } from "@/components/skeletons/debate-card-skeleton";
import {
  Trophy,
  Swords,
  Shield,
  Users,
  Calendar,
  Settings,
  Gift,
  Coins,
  Flame,
} from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { data: user, isLoading } = trpc.user.me.useQuery();

  const { data: debatesData, isLoading: debatesLoading } =
    trpc.debate.myDebates.useInfiniteQuery(
      { limit: 6 },
      { getNextPageParam: (p) => p.nextCursor, enabled: !!user }
    );

  const claimReward = trpc.settings.claimDailyReward.useMutation({
    onSuccess: (data) => {
      toast.success(`Claimed ${data.reward} coins! Streak: ${data.streak} days`);
    },
    onError: (err) => toast.error(err.message),
  });

  const debates = debatesData?.pages.flatMap((p) => p.debates) ?? [];

  if (isLoading) return <ProfileSkeleton />;
  if (!user) return null;

  const winRate = user.total_debates > 0
    ? Math.round((user.debates_won / user.total_debates) * 100)
    : 0;

  const sub = user.user_subscriptions;
  const isPro = sub?.status === "ACTIVE" && sub?.tier !== "FREE";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback className="text-xl bg-electric-blue/20 text-electric-blue">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              {isPro && (
                <Badge className="bg-electric-blue/20 text-electric-blue border-electric-blue/30">
                  PRO
                </Badge>
              )}
              {user.is_creator && (
                <Badge className="bg-cyber-green/20 text-cyber-green border-cyber-green/30">
                  Creator
                </Badge>
              )}
              {user.is_admin && (
                <Badge className="bg-hot-pink/20 text-hot-pink border-hot-pink/30">
                  Admin
                </Badge>
              )}
            </div>
            {user.bio && (
              <p className="mt-1 text-sm text-muted-foreground">{user.bio}</p>
            )}
            <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {user.follower_count} followers
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Joined {formatDistanceToNow(user.created_at)}
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings">
            <Settings className="mr-1 h-3.5 w-3.5" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Daily reward + streak */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-neon-orange" />
            <div>
              <p className="text-sm font-medium">
                {user.consecutive_login_days ?? 0} day streak
              </p>
              <p className="text-xs text-muted-foreground">
                Best: {user.longest_login_streak ?? 0} days
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm font-semibold text-neon-orange">
              <Coins className="h-4 w-4" />
              {user.coins}
            </div>
            <Button
              size="sm"
              className="bg-cyber-green text-black hover:bg-cyber-green/90"
              onClick={() => claimReward.mutate()}
              disabled={claimReward.isPending}
            >
              <Gift className="mr-1 h-3.5 w-3.5" />
              Daily Reward
            </Button>
          </div>
        </CardContent>
      </Card>

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

      <div className="flex items-center justify-center gap-6 text-sm">
        <span className="flex items-center gap-1">
          <Trophy className="h-4 w-4 text-cyber-green" /> {user.debates_won} W
        </span>
        <span className="flex items-center gap-1">
          <Swords className="h-4 w-4 text-destructive" /> {user.debates_lost} L
        </span>
        <span className="flex items-center gap-1">
          <Shield className="h-4 w-4 text-muted-foreground" /> {user.debates_tied} T
        </span>
      </div>

      <Separator />

      {/* Debates */}
      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Debates</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="mt-4">
          {debatesLoading ? (
            <DebateListSkeleton count={3} />
          ) : debates.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No debates yet. Start your first debate!
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

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-2 h-4 w-60" />
          <Skeleton className="mt-2 h-3 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
