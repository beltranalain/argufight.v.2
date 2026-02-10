"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc-client";
import { useRealtimeChat, type ChatMessage } from "@/hooks/use-realtime-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { toast } from "sonner";

interface LiveChatProps {
  debateId: string;
}

export function LiveChat({ debateId }: LiveChatProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id as string | undefined;
  const username = (session?.user as { username?: string })?.username;
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load initial messages via tRPC
  const { data: initialData, isLoading } = trpc.chat.getMessages.useQuery(
    { debateId, limit: 50 },
    { enabled: !!userId }
  );

  // Real-time subscription
  const { messages: realtimeMessages, typingUsers, sendTyping, setInitialMessages } =
    useRealtimeChat({
      debateId,
      userId,
      username,
      enabled: !!userId,
    });

  // Set initial messages when loaded
  useEffect(() => {
    if (initialData?.messages) {
      setInitialMessages(initialData.messages as unknown as ChatMessage[]);
    }
  }, [initialData, setInitialMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [realtimeMessages]);

  const sendMutation = trpc.chat.send.useMutation({
    onError: (err) => toast.error(err.message),
  });

  const handleSend = () => {
    if (!input.trim() || !userId) return;
    sendMutation.mutate({ debateId, content: input.trim() });
    setInput("");
    sendTyping(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (value.length > 0) {
      sendTyping(true);
    } else {
      sendTyping(false);
    }
  };

  if (!userId) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/80 p-6 text-center">
        <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Log in to join the chat
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-border/50 bg-card/80">
      <div className="border-b border-border/50 px-4 py-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-electric-blue" />
          Live Chat
        </h4>
      </div>

      {/* Messages area */}
      <ScrollArea className="h-[300px] p-3" ref={scrollRef}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : realtimeMessages.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No messages yet. Start the conversation!
          </p>
        ) : (
          <div className="space-y-2">
            {realtimeMessages.map((msg) => {
              const isOwn = msg.author_id === userId;
              const msgUser = msg.users;
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback className="text-[9px]">
                      {(msgUser?.username ?? "??").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-1.5 text-sm ${
                      isOwn
                        ? "bg-electric-blue/20 text-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {!isOwn && (
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {msgUser?.username}
                      </span>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <span className="text-[9px] text-muted-foreground">
                      {formatDistanceToNow(msg.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground animate-pulse">
            {typingUsers.map((u) => u.username).join(", ")}{" "}
            {typingUsers.length === 1 ? "is" : "are"} typing...
          </div>
        )}
      </ScrollArea>

      {/* Input area */}
      <div className="border-t border-border/50 p-2">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={500}
            className="text-sm"
          />
          <Button
            size="icon"
            className="shrink-0 bg-electric-blue text-black hover:bg-electric-blue/90"
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
