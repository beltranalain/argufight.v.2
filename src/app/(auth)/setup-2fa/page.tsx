"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Setup2FAPage() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(true);

  useEffect(() => {
    async function initSetup() {
      try {
        const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
        const data = await res.json();
        if (res.ok) {
          setQrCode(data.qrCode);
          setSecret(data.secret);
        } else {
          setError(data.error || "Failed to initialize 2FA setup");
        }
      } catch {
        setError("Failed to initialize 2FA setup");
      } finally {
        setSetupLoading(false);
      }
    }
    initSetup();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/2fa/verify-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, secret }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid verification code");
        return;
      }

      router.push("/dashboard?2fa=enabled");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (setupLoading) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Setting up Two-Factor Authentication
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Scan the QR code with your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-6">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {qrCode && (
            <div className="flex justify-center">
              <div
                className="rounded-lg bg-white p-4"
                dangerouslySetInnerHTML={{ __html: qrCode }}
              />
            </div>
          )}

          {secret && (
            <div className="space-y-1">
              <p className="text-center text-xs text-muted-foreground">
                Or enter this code manually:
              </p>
              <p className="text-center font-mono text-sm tracking-widest text-electric-blue">
                {secret}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="token">Verification Code</Label>
            <Input
              id="token"
              type="text"
              placeholder="Enter 6-digit code"
              value={token}
              onChange={(e) =>
                setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
              autoComplete="one-time-code"
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-electric-blue text-black hover:bg-electric-blue/90"
            disabled={loading || token.length !== 6}
          >
            {loading ? "Verifying..." : "Enable 2FA"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
