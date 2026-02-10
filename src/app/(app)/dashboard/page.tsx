import { auth } from "@/server/auth/config";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session?.user?.username || session?.user?.name}
        </h1>
        <p className="text-muted-foreground">
          Your debate dashboard — Phase 2 will add the full layout
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">ELO Rating</p>
          <p className="text-2xl font-bold text-electric-blue">
            {session?.user?.eloRating || 1200}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Coins</p>
          <p className="text-2xl font-bold text-neon-orange">
            {session?.user?.coins || 0}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Role</p>
          <p className="text-2xl font-bold">
            {session?.user?.isAdmin ? "Admin" : "Debater"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Creator</p>
          <p className="text-2xl font-bold">
            {session?.user?.isCreator ? "Yes" : "No"}
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        The full dashboard with debate panels, challenges, leaderboard, and
        tournaments will be built in Phase 2-3.
      </p>
    </div>
  );
}
