"use client";

import { useState, useOptimistic } from "react";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark, Share2 } from "lucide-react";
import { toast } from "sonner";

interface DebateInteractionsProps {
  debateId: string;
  initialLiked?: boolean;
  initialSaved?: boolean;
  likeCount: number;
  saveCount: number;
  slug?: string | null;
}

export function DebateInteractions({
  debateId,
  initialLiked = false,
  initialSaved = false,
  likeCount,
  saveCount,
  slug,
}: DebateInteractionsProps) {
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(initialLiked);
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(initialSaved);
  const [likes, setLikes] = useState(likeCount);
  const [saves, setSaves] = useState(saveCount);

  const likeMutation = trpc.debate.like.useMutation({
    onMutate: () => {
      setOptimisticLiked(!optimisticLiked);
      setLikes((prev) => (optimisticLiked ? prev - 1 : prev + 1));
    },
    onError: () => {
      setOptimisticLiked(initialLiked);
      setLikes(likeCount);
      toast.error("Failed to update like");
    },
  });

  const saveMutation = trpc.debate.save.useMutation({
    onMutate: () => {
      setOptimisticSaved(!optimisticSaved);
      setSaves((prev) => (optimisticSaved ? prev - 1 : prev + 1));
    },
    onError: () => {
      setOptimisticSaved(initialSaved);
      setSaves(saveCount);
      toast.error("Failed to update save");
    },
  });

  const shareMutation = trpc.debate.share.useMutation();

  const handleShare = async () => {
    const url = slug
      ? `${window.location.origin}/debates/${slug}`
      : `${window.location.origin}/debate/${debateId}`;

    try {
      await navigator.clipboard.writeText(url);
      shareMutation.mutate({ debateId, method: "clipboard" });
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className={optimisticLiked ? "text-hot-pink" : "text-muted-foreground"}
        onClick={() => likeMutation.mutate({ debateId })}
        disabled={likeMutation.isPending}
      >
        <Heart className={`mr-1 h-4 w-4 ${optimisticLiked ? "fill-current" : ""}`} />
        {likes}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={optimisticSaved ? "text-electric-blue" : "text-muted-foreground"}
        onClick={() => saveMutation.mutate({ debateId })}
        disabled={saveMutation.isPending}
      >
        <Bookmark className={`mr-1 h-4 w-4 ${optimisticSaved ? "fill-current" : ""}`} />
        {saves}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={handleShare}
      >
        <Share2 className="mr-1 h-4 w-4" />
        Share
      </Button>
    </div>
  );
}
