"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { data: user, isLoading } = trpc.user.me.useQuery();
  const utils = trpc.useUtils();

  // Profile form
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profileInit, setProfileInit] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  // Init form values from user data
  if (user && !profileInit) {
    setUsername(user.username);
    setBio(user.bio ?? "");
    setProfileInit(true);
  }

  const updateProfile = trpc.settings.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated!");
      utils.user.me.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const changePassword = trpc.settings.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password changed!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSaveProfile = () => {
    updateProfile.mutate({
      username: username !== user?.username ? username : undefined,
      bio,
    });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    changePassword.mutate({ currentPassword, newPassword });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) return null;

  const sub = user.user_subscriptions;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Update your public information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{bio.length}/500</p>
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={updateProfile.isPending}
            className="bg-electric-blue text-black hover:bg-electric-blue/90"
          >
            {updateProfile.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Password
          </CardTitle>
          <CardDescription>Change your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={changePassword.isPending || !currentPassword || !newPassword}
            variant="outline"
          >
            {changePassword.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lock className="mr-2 h-4 w-4" />
            )}
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                user.totp_enabled
                  ? "border-cyber-green/30 text-cyber-green"
                  : "border-border text-muted-foreground"
              }
            >
              {user.totp_enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Subscription</p>
              <p className="text-xs text-muted-foreground">
                {sub ? `${sub.tier} — ${sub.status}` : "Free tier"}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/upgrade">Manage</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
