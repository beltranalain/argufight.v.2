"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, MessageSquare, CornerDownRight } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { toast } from "sonner";

interface CommentsSectionProps {
  debateId: string;
}

export function CommentsSection({ debateId }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const utils = trpc.useUtils();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.debate.getComments.useInfiniteQuery(
      { debateId, limit: 20 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const addComment = trpc.debate.addComment.useMutation({
    onSuccess: () => {
      setNewComment("");
      setReplyTo(null);
      setReplyContent("");
      utils.debate.getComments.invalidate({ debateId });
    },
    onError: (err) => toast.error(err.message),
  });

  const comments = data?.pages.flatMap((p) => p.comments) ?? [];

  const handleSubmitComment = () => {
    if (newComment.trim().length === 0) return;
    addComment.mutate({ debateId, content: newComment.trim() });
  };

  const handleSubmitReply = (parentId: string) => {
    if (replyContent.trim().length === 0) return;
    addComment.mutate({ debateId, content: replyContent.trim(), parentId });
  };

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 font-semibold">
        <MessageSquare className="h-4 w-4" />
        Comments
      </h3>

      {/* New comment input */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={2}
          maxLength={2000}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleSubmitComment}
            disabled={addComment.isPending || newComment.trim().length === 0}
            className="bg-electric-blue text-black hover:bg-electric-blue/90"
          >
            {addComment.isPending ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : null}
            Comment
          </Button>
        </div>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-border/50 bg-card/50 p-3">
              <div className="flex items-start gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px]">
                    {comment.users.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{comment.users.username}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(comment.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/90">{comment.content}</p>
                  <button
                    className="mt-1 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  >
                    Reply
                    {(comment._count?.other_debate_comments ?? 0) > 0 &&
                      ` (${comment._count.other_debate_comments})`}
                  </button>

                  {/* Replies */}
                  {comment.other_debate_comments &&
                    comment.other_debate_comments.length > 0 && (
                      <div className="mt-2 space-y-2 border-l-2 border-border/30 pl-3">
                        {comment.other_debate_comments.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-2">
                            <CornerDownRight className="mt-0.5 h-3 w-3 text-muted-foreground shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">
                                  {reply.users.username}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {formatDistanceToNow(reply.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-foreground/90">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Reply input */}
                  {replyTo === comment.id && (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={2}
                        maxLength={2000}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setReplyTo(null);
                            setReplyContent("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={addComment.isPending || replyContent.trim().length === 0}
                          className="bg-electric-blue text-black hover:bg-electric-blue/90"
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {hasNextPage && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : null}
              Load more comments
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
