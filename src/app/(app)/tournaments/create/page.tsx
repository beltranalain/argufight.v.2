"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc-client";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CreateTournamentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [totalRounds, setTotalRounds] = useState(3);
  const [roundDuration, setRoundDuration] = useState(3600);
  const [startDate, setStartDate] = useState("");
  const [format, setFormat] = useState<"BRACKET" | "CHAMPIONSHIP" | "KING_OF_THE_HILL">("BRACKET");
  const [reseedMethod, setReseedMethod] = useState<"ELO_BASED" | "TOURNAMENT_WINS" | "RANDOM">("ELO_BASED");
  const [minElo, setMinElo] = useState<number | undefined>();
  const [isPrivate, setIsPrivate] = useState(false);
  const [entryFee, setEntryFee] = useState(0);
  const [prizePool, setPrizePool] = useState(0);

  const createMutation = trpc.tournament.create.useMutation({
    onSuccess: (data) => {
      toast.success("Tournament created!");
      router.push(`/tournaments/${data.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate) {
      toast.error("Name and start date are required");
      return;
    }
    createMutation.mutate({
      name,
      description: description || undefined,
      maxParticipants,
      totalRounds,
      roundDuration,
      startDate: new Date(startDate).toISOString(),
      format,
      reseedMethod,
      minElo,
      isPrivate,
      entryFee,
      prizePool,
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tournaments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-neon-orange" />
            Create Tournament
          </h1>
          <p className="text-sm text-muted-foreground">
            Set up a new competition
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Basic Info</CardTitle>
            <CardDescription>Name and describe your tournament</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Weekly Championship"
                maxLength={100}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this tournament about?"
                maxLength={2000}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Format & Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRACKET">Bracket</SelectItem>
                    <SelectItem value="CHAMPIONSHIP">Championship</SelectItem>
                    <SelectItem value="KING_OF_THE_HILL">King of the Hill</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reseed Method</Label>
                <Select
                  value={reseedMethod}
                  onValueChange={(v) => setReseedMethod(v as typeof reseedMethod)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ELO_BASED">ELO Based</SelectItem>
                    <SelectItem value="TOURNAMENT_WINS">Tournament Wins</SelectItem>
                    <SelectItem value="RANDOM">Random</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Participants</Label>
                <Select
                  value={String(maxParticipants)}
                  onValueChange={(v) => setMaxParticipants(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="16">16</SelectItem>
                    <SelectItem value="32">32</SelectItem>
                    <SelectItem value="64">64</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rounds per Match</Label>
                <Select
                  value={String(totalRounds)}
                  onValueChange={(v) => setTotalRounds(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Round Duration</Label>
                <Select
                  value={String(roundDuration)}
                  onValueChange={(v) => setRoundDuration(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300">5 minutes</SelectItem>
                    <SelectItem value="600">10 minutes</SelectItem>
                    <SelectItem value="1800">30 minutes</SelectItem>
                    <SelectItem value="3600">1 hour</SelectItem>
                    <SelectItem value="86400">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-elo">Minimum ELO (optional)</Label>
              <Input
                id="min-elo"
                type="number"
                value={minElo ?? ""}
                onChange={(e) =>
                  setMinElo(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="No restriction"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-private"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="is-private" className="cursor-pointer">
                Private tournament (invite only)
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Economy</CardTitle>
            <CardDescription>Entry fees and prizes (in coins)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entry-fee">Entry Fee</Label>
                <Input
                  id="entry-fee"
                  type="number"
                  min={0}
                  value={entryFee}
                  onChange={(e) => setEntryFee(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prize-pool">Prize Pool</Label>
                <Input
                  id="prize-pool"
                  type="number"
                  min={0}
                  value={prizePool}
                  onChange={(e) => setPrizePool(Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full bg-electric-blue text-black hover:bg-electric-blue/90"
        >
          {createMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trophy className="mr-2 h-4 w-4" />
          )}
          Create Tournament
        </Button>
      </form>
    </div>
  );
}
