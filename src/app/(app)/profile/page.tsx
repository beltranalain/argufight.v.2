"use client";

import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Loader2,
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
            <AvatarFallback className="text-xl bg-electric-blue/20 text-electric-blue font-bold">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-extrabold text-foreground">{user.username}</h1>
              {isPro && (
                <span className="inline-flex px-2.5 py-0.5 rounded-md bg-electric-blue/15 text-electric-blue text-[11px] font-bold">
                  PRO
                </span>
              )}
              {user.is_creator && (
                <span className="inline-flex px-2.5 py-0.5 rounded-md bg-cyber-green/15 text-cyber-green text-[11px] font-bold">
                  Creator
                </span>
              )}
              {user.is_admin && (
                <span className="inline-flex px-2.5 py-0.5 rounded-md bg-hot-pink/15 text-hot-pink text-[11px] font-bold">
                  Admin
                </span>
              )}
            </div>
            {user.bio && (
              <p className="mt-1 text-sm text-text-secondary">{user.bio}</p>
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
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-bg-tertiary border border-af-border text-sm font-semibold text-foreground hover:border-electric-blue hover:text-electric-blue transition-all"
        >
          <Settings className="h-3.5 w-3.5" />
          Edit Profile
        </Link>
      </div>

      {/* Daily reward + streak */}
      <div className="bg-bg-secondary border border-af-border rounded-[14px] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flame className="h-6 w-6 text-neon-orange" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {user.consecutive_login_days ?? 0} day streak
            </p>
            <p className="text-xs text-muted-foreground">
              Best: {user.longest_login_streak ?? 0} days
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm font-bold text-neon-orange">
            <Coins className="h-4 w-4" />
            {user.coins}
          </div>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyber-green text-black text-sm font-bold hover:bg-cyber-green/90 transition-colors disabled:opacity-50"
            onClick={() => claimReward.mutate()}
            disabled={claimReward.isPending}
          >
            {claimReward.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Gift className="h-3.5 w-3.5" />
            )}
            Daily Reward
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="bg-bg-secondary border border-af-border rounded-[10px] p-4 text-center">
          <p className="text-[28px] font-extrabold text-electric-blue">{user.elo_rating}</p>
          <p className="text-xs text-muted-foreground">ELO Rating</p>
        </div>
        <div className="bg-bg-secondary border border-af-border rounded-[10px] p-4 text-center">
          <p className="text-[28px] font-extrabold text-foreground">{user.total_debates}</p>
          <p className="text-xs text-muted-foreground">Debates</p>
        </div>
        <div className="bg-bg-secondary border border-af-border rounded-[10px] p-4 text-center">
          <p className="text-[28px] font-extrabold text-cyber-green">{winRate}%</p>
          <p className="text-xs text-muted-foreground">Win Rate</p>
        </div>
        <div className="bg-bg-secondary border border-af-border rounded-[10px] p-4 text-center">
          <p className="text-[28px] font-extrabold text-yellow-400">{user.current_belts_count}</p>
          <p className="text-xs text-muted-foreground">Belts Held</p>
        </div>
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

      <div className="border-t border-af-border" />

      {/* Recent Debates */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Recent Debates</h2>
        {debatesLoading ? (
          <DebateListSkeleton count={3} />
        ) : debates.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-af-border rounded-xl">
            <Swords className="w-10 h-10 mx-auto mb-3 text-electric-blue opacity-60" />
            <p className="text-sm font-bold text-foreground">No debates yet</p>
            <p className="text-[13px] text-muted-foreground mt-1">
              Start your first debate!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {debates.map((d) => (
              <DebateCard key={d.id} debate={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-bg-secondary border border-af-border animate-pulse" />
        <div className="space-y-2">
          <div className="h-7 w-40 rounded bg-bg-secondary animate-pulse" />
          <div className="h-4 w-60 rounded bg-bg-secondary animate-pulse" />
          <div className="h-3 w-32 rounded bg-bg-secondary animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-[10px] bg-bg-secondary border border-af-border animate-pulse" />
        ))}
      </div>
    </div>
  );
}
