"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Send, Users } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function AdminNotificationsPage() {
  const [type, setType] = useState("SYSTEM");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [broadcast, setBroadcast] = useState(false);

  const sendNotification = trpc.admin.sendNotification.useMutation({
    onSuccess: (result) => {
      toast.success(`Notification sent to ${result.sent} user(s)`);
      setTitle("");
      setMessage("");
      setUserId("");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      <Card className="border-border/50 bg-card/80 max-w-xl">
        <CardHeader>
          <CardTitle className="text-sm">Send Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SYSTEM">System</SelectItem>
                <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                <SelectItem value="PROMOTION">Promotion</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Title</Label>
            <Input
              placeholder="Notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label>Message</Label>
            <Textarea
              placeholder="Notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={broadcast} onCheckedChange={setBroadcast} />
            <Label className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Broadcast to all users
            </Label>
          </div>

          {!broadcast && (
            <div>
              <Label>User ID</Label>
              <Input
                placeholder="Target user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          )}

          <Button
            onClick={() =>
              sendNotification.mutate({
                type,
                title,
                message,
                broadcast,
                userId: broadcast ? undefined : userId || undefined,
              })
            }
            disabled={!title || !message || (!broadcast && !userId)}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Notification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
