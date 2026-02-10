"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateDebateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { value: "SPORTS", label: "Sports" },
  { value: "POLITICS", label: "Politics" },
  { value: "TECH", label: "Tech" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "SCIENCE", label: "Science" },
  { value: "MUSIC", label: "Music" },
  { value: "OTHER", label: "Other" },
];

const roundOptions = [
  { value: "1", label: "1 Round" },
  { value: "3", label: "3 Rounds" },
  { value: "5", label: "5 Rounds (Default)" },
  { value: "7", label: "7 Rounds" },
  { value: "10", label: "10 Rounds" },
];

export function CreateDebateDialog({ open, onOpenChange }: CreateDebateDialogProps) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [position, setPosition] = useState("FOR");
  const [totalRounds, setTotalRounds] = useState("5");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [speedMode, setSpeedMode] = useState(false);
  const [allowCopyPaste, setAllowCopyPaste] = useState(true);

  const utils = trpc.useUtils();

  const createMutation = trpc.debate.create.useMutation({
    onSuccess: (debate) => {
      toast.success("Debate created!");
      utils.debate.list.invalidate();
      onOpenChange(false);
      router.push(`/debate/${debate.id}`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.length < 5) {
      toast.error("Topic must be at least 5 characters");
      return;
    }
    createMutation.mutate({
      topic,
      description: description || undefined,
      category: category as "SPORTS" | "POLITICS" | "TECH" | "ENTERTAINMENT" | "SCIENCE" | "MUSIC" | "OTHER",
      challengerPosition: position as "FOR" | "AGAINST",
      totalRounds: parseInt(totalRounds),
      visibility: visibility as "PUBLIC" | "PRIVATE" | "UNLISTED",
      speedMode,
      allowCopyPaste,
    });
  };

  const resetForm = () => {
    setTopic("");
    setDescription("");
    setCategory("OTHER");
    setPosition("FOR");
    setTotalRounds("5");
    setVisibility("PUBLIC");
    setSpeedMode(false);
    setAllowCopyPaste(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a Debate</DialogTitle>
          <DialogDescription>
            Challenge the world to a structured debate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., AI will replace most jobs within 10 years"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">{topic.length}/200</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add context or rules for the debate..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Your Position</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOR">For</SelectItem>
                  <SelectItem value="AGAINST">Against</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rounds</Label>
              <Select value={totalRounds} onValueChange={setTotalRounds}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roundOptions.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="UNLISTED">Unlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={speedMode}
                onChange={(e) => setSpeedMode(e.target.checked)}
                className="rounded border-border"
              />
              Speed mode
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={allowCopyPaste}
                onChange={(e) => setAllowCopyPaste(e.target.checked)}
                className="rounded border-border"
              />
              Allow copy/paste
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-electric-blue text-black hover:bg-electric-blue/90"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Debate"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
