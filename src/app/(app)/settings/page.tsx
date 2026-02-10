"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-8 w-40 rounded bg-bg-secondary animate-pulse" />
        <div className="h-64 w-full rounded-[14px] bg-bg-secondary border border-af-border animate-pulse" />
        <div className="h-48 w-full rounded-[14px] bg-bg-secondary border border-af-border animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  const sub = user.user_subscriptions;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-[24px] font-extrabold text-foreground">Settings</h1>
        <p className="text-[13px] text-text-secondary">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
        <div className="p-6 border-b border-af-border">
          <h2 className="text-base font-bold text-foreground">Profile</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Update your public information</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <Label className="text-[13px] text-text-secondary mb-1.5 block">Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
              className="bg-bg-tertiary border-af-border"
            />
          </div>
          <div>
            <Label className="text-[13px] text-text-secondary mb-1.5 block">Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              maxLength={500}
              rows={3}
              className="bg-bg-tertiary border-af-border"
            />
            <p className="text-[11px] text-muted-foreground mt-1">{bio.length}/500</p>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={updateProfile.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-electric-blue text-black font-bold text-sm hover:bg-[#00b8e6] transition-colors disabled:opacity-50"
          >
            {updateProfile.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Profile
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
        <div className="p-6 border-b border-af-border">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Password
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Change your password</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <Label className="text-[13px] text-text-secondary mb-1.5 block">Current Password</Label>
            <div className="relative">
              <Input
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-bg-tertiary border-af-border"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label className="text-[13px] text-text-secondary mb-1.5 block">New Password</Label>
            <Input
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-bg-tertiary border-af-border"
            />
          </div>
          <div>
            <Label className="text-[13px] text-text-secondary mb-1.5 block">Confirm New Password</Label>
            <Input
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-bg-tertiary border-af-border"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={changePassword.isPending || !currentPassword || !newPassword}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-bg-tertiary border border-af-border text-foreground font-semibold text-sm hover:border-electric-blue hover:text-electric-blue transition-all disabled:opacity-50"
          >
            {changePassword.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            Change Password
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
        <div className="p-6 border-b border-af-border">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
            <span
              className={`inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold ${
                user.totp_enabled
                  ? "bg-cyber-green/15 text-cyber-green"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {user.totp_enabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          <div className="border-t border-af-border" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Subscription</p>
              <p className="text-xs text-muted-foreground">
                {sub ? `${sub.tier} — ${sub.status}` : "Free tier"}
              </p>
            </div>
            <Link
              href="/upgrade"
              className="inline-flex items-center px-4 py-1.5 rounded-lg bg-bg-tertiary border border-af-border text-sm font-semibold text-foreground hover:border-electric-blue hover:text-electric-blue transition-all"
            >
              Manage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
