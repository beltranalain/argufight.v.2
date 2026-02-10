"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc-client";
import { useRealtimeMessages, type DirectMessage } from "@/hooks/use-realtime-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Loader2, MessageSquare, Search } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { toast } from "sonner";

export default function MessagesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id as string | undefined;
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversations
  const { data: convData, isLoading: convsLoading } =
    trpc.message.conversations.useQuery(
      { limit: 50 },
      { enabled: !!userId }
    );

  // Load messages for selected conversation
  const { data: msgsData, isLoading: msgsLoading } =
    trpc.message.getMessages.useQuery(
      { conversationId: selectedConversation!, limit: 50 },
      { enabled: !!selectedConversation }
    );

  // Realtime messages
  const { messages: realtimeMessages, setInitialMessages } = useRealtimeMessages({
    conversationId: selectedConversation ?? undefined,
    enabled: !!selectedConversation,
  });

  // Sync initial messages
  useEffect(() => {
    if (msgsData?.messages) {
      setInitialMessages(msgsData.messages as unknown as DirectMessage[]);
    }
  }, [msgsData, setInitialMessages]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [realtimeMessages]);

  const utils = trpc.useUtils();

  const sendMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      setMessageInput("");
      utils.message.conversations.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const markReadMutation = trpc.message.markRead.useMutation({
    onSuccess: () => utils.message.conversations.invalidate(),
  });

  const conversations = convData?.conversations ?? [];
  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    markReadMutation.mutate({ conversationId: id });
  };

  const handleSend = () => {
    if (!messageInput.trim() || !selectedConv) return;
    sendMutation.mutate({
      receiverId: selectedConv.otherUser.id,
      content: messageInput.trim(),
    });
  };

  const filteredConversations = searchQuery
    ? conversations.filter((c) =>
        c.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-border/50 bg-card/80 overflow-hidden">
      {/* Sidebar - Conversations list */}
      <div className="w-80 border-r border-border/50 flex flex-col">
        <div className="p-3 border-b border-border/50">
          <h2 className="font-semibold flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-sm h-8"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {convsLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="mt-1 h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <p className="p-6 text-center text-xs text-muted-foreground">
              No conversations yet
            </p>
          ) : (
            <div>
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  className={`flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-muted/50 transition-colors ${
                    selectedConversation === conv.id
                      ? "bg-electric-blue/10 border-l-2 border-electric-blue"
                      : ""
                  }`}
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <div className="relative">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs">
                        {conv.otherUser.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {conv.hasUnread && (
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-electric-blue" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${conv.hasUnread ? "font-semibold" : "font-medium"}`}>
                        {conv.otherUser.username}
                      </span>
                      {conv.lastMessageAt && (
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(conv.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage.sender_id === userId ? "You: " : ""}
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main area - Messages */}
      <div className="flex-1 flex flex-col">
        {!selectedConversation ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-medium">Select a conversation</p>
              <p className="text-sm text-muted-foreground">
                Choose someone to message from the sidebar
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {selectedConv?.otherUser.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {selectedConv?.otherUser.username}
              </span>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {msgsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : realtimeMessages.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  No messages yet. Say hello!
                </p>
              ) : (
                <div className="space-y-3">
                  {realtimeMessages.map((msg) => {
                    const isOwn = msg.sender_id === userId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-3 py-2 ${
                            isOwn
                              ? "bg-electric-blue/20 text-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                          <span className="text-[9px] text-muted-foreground">
                            {formatDistanceToNow(msg.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border/50 p-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  maxLength={2000}
                />
                <Button
                  size="icon"
                  className="shrink-0 bg-electric-blue text-black hover:bg-electric-blue/90"
                  onClick={handleSend}
                  disabled={!messageInput.trim() || sendMutation.isPending}
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
