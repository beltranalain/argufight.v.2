"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Shield, Ban, Coins } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"created_at" | "username" | "elo_rating" | "coins">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [editUser, setEditUser] = useState<Record<string, unknown> | null>(null);
  const [coinAmount, setCoinAmount] = useState("");
  const [coinDesc, setCoinDesc] = useState("");

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.users.useQuery({
    search: search || undefined,
    page,
    limit: 20,
    sortBy,
    sortDir,
  });

  const updateUser = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success("User updated");
      utils.admin.users.invalidate();
      setEditUser(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const grantCoins = trpc.admin.grantCoins.useMutation({
    onSuccess: (result) => {
      toast.success(`Coins updated. New balance: ${result.newBalance}`);
      utils.admin.users.invalidate();
      setCoinAmount("");
      setCoinDesc("");
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = [
    {
      key: "username",
      header: "Username",
      sortable: true,
      render: (row: Record<string, unknown>) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{String(row.username)}</span>
          {Boolean(row.is_admin) && (
            <Badge variant="outline" className="border-electric-blue/50 text-electric-blue text-[10px]">
              Admin
            </Badge>
          )}
          {Boolean(row.is_banned) && (
            <Badge variant="destructive" className="text-[10px]">Banned</Badge>
          )}
        </div>
      ),
    },
    { key: "email", header: "Email" },
    {
      key: "elo_rating",
      header: "ELO",
      sortable: true,
      render: (row: Record<string, unknown>) => (
        <span className="font-mono text-xs">{Number(row.elo_rating)}</span>
      ),
    },
    {
      key: "coins",
      header: "Coins",
      sortable: true,
      render: (row: Record<string, unknown>) => (
        <span className="text-neon-orange font-mono text-xs">{Number(row.coins)}</span>
      ),
    },
    {
      key: "total_debates",
      header: "Debates",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs">
          {Number(row.total_debates)} ({Number(row.debates_won)}W / {Number(row.debates_lost)}L)
        </span>
      ),
    },
    {
      key: "user_subscriptions",
      header: "Tier",
      render: (row: Record<string, unknown>) => {
        const sub = row.user_subscriptions as { tier: string; status: string } | null;
        if (!sub || sub.tier === "FREE") return <span className="text-xs text-muted-foreground">Free</span>;
        return (
          <Badge className="bg-electric-blue/10 text-electric-blue border-electric-blue/30 text-[10px]">
            {sub.tier}
          </Badge>
        );
      },
    },
    {
      key: "created_at",
      header: "Joined",
      sortable: true,
      render: (row: Record<string, unknown>) => (
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(row.created_at as string), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Record<string, unknown>) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditUser(row); }}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">User Management</h1>
        {data && (
          <Badge variant="outline" className="ml-auto">{data.total} total</Badge>
        )}
      </div>

      <DataTable
        columns={columns}
        data={(data?.users ?? []) as Record<string, unknown>[]}
        isLoading={isLoading}
        searchPlaceholder="Search users..."
        onSearch={(q) => { setSearch(q); setPage(1); }}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        onSort={(key, dir) => {
          setSortBy(key as typeof sortBy);
          setSortDir(dir);
        }}
      />

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User: {editUser?.username as string}</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={editUser.is_admin ? "destructive" : "outline"}
                  size="sm"
                  onClick={() =>
                    updateUser.mutate({
                      userId: editUser.id as string,
                      is_admin: !editUser.is_admin,
                    })
                  }
                >
                  <Shield className="mr-1 h-3 w-3" />
                  {editUser.is_admin ? "Remove Admin" : "Make Admin"}
                </Button>
                <Button
                  variant={editUser.is_banned ? "outline" : "destructive"}
                  size="sm"
                  onClick={() =>
                    updateUser.mutate({
                      userId: editUser.id as string,
                      is_banned: !editUser.is_banned,
                    })
                  }
                >
                  <Ban className="mr-1 h-3 w-3" />
                  {editUser.is_banned ? "Unban" : "Ban User"}
                </Button>
              </div>

              <div className="border-t border-border/50 pt-4">
                <Label className="text-xs">Grant/Deduct Coins</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Amount (negative to deduct)"
                    value={coinAmount}
                    onChange={(e) => setCoinAmount(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <Input
                  placeholder="Description"
                  value={coinDesc}
                  onChange={(e) => setCoinDesc(e.target.value)}
                  className="mt-2"
                />
                <Button
                  size="sm"
                  className="mt-2"
                  disabled={!coinAmount || !coinDesc}
                  onClick={() =>
                    grantCoins.mutate({
                      userId: editUser.id as string,
                      amount: parseInt(coinAmount),
                      description: coinDesc,
                    })
                  }
                >
                  <Coins className="mr-1 h-3 w-3" />
                  Apply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
