"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Swords, Coins } from "lucide-react";
import { toast } from "sonner";

interface ChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  belt: {
    id: string;
    name: string;
    type: string;
    category?: string | null;
    users?: {
      username: string;
      elo_rating: number;
    } | null;
  };
}

export function ChallengeModal({ open, onOpenChange, belt }: ChallengeModalProps) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [totalRounds, setTotalRounds] = useState(3);
  const [usesFreeChallenge, setUsesFreeChallenge] = useState(false);

  const { data: settings } = trpc.belt.settings.useQuery(
    { beltType: belt.type as "ROOKIE" | "CATEGORY" | "CHAMPIONSHIP" | "UNDEFEATED" | "TOURNAMENT" },
    { enabled: open }
  );

  const challengeMutation = trpc.belt.challenge.useMutation({
    onSuccess: () => {
      toast.success("Challenge sent!");
      onOpenChange(false);
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const entryFee =
    !usesFreeChallenge && settings?.require_coins_for_challenge
      ? settings.entry_fee_base
      : 0;

  const handleSubmit = () => {
    if (!topic.trim()) {
      toast.error("Topic is required");
      return;
    }
    challengeMutation.mutate({
      beltId: belt.id,
      topic,
      description: description || undefined,
      category: belt.category || undefined,
      totalRounds,
      usesFreeChallenge,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-neon-orange" />
            Challenge for {belt.name}
          </DialogTitle>
          <DialogDescription>
            {belt.users
              ? `Challenge ${belt.users.username} (ELO ${belt.users.elo_rating}) for this belt`
              : "No current holder"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="challenge-topic">Debate Topic</Label>
            <Input
              id="challenge-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What should you debate about?"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenge-desc">Description (optional)</Label>
            <Textarea
              id="challenge-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional context..."
              maxLength={2000}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Rounds</Label>
            <Select
              value={String(totalRounds)}
              onValueChange={(v) => setTotalRounds(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Round</SelectItem>
                <SelectItem value="3">3 Rounds</SelectItem>
                <SelectItem value="5">5 Rounds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings?.allow_free_challenges && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="free-challenge"
                checked={usesFreeChallenge}
                onChange={(e) => setUsesFreeChallenge(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="free-challenge" className="text-sm cursor-pointer">
                Use free challenge ({settings.free_challenges_per_week ?? 1}/week)
              </Label>
            </div>
          )}

          {entryFee > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-neon-orange" />
              <span>Entry fee: <strong>{entryFee} coins</strong></span>
            </div>
          )}

          {settings && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-1">Reward split</p>
              <div className="flex gap-3 text-xs">
                <Badge variant="outline" className="text-[10px] border-cyber-green/30 text-cyber-green">
                  Winner: {settings.winner_reward_percent}%
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  Loser: {settings.loser_consolation_percent}%
                </Badge>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Platform: {settings.platform_fee_percent}%
                </Badge>
              </div>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={challengeMutation.isPending || !topic.trim()}
            className="w-full bg-neon-orange text-black hover:bg-neon-orange/90"
          >
            {challengeMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Swords className="mr-2 h-4 w-4" />
            )}
            Send Challenge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
