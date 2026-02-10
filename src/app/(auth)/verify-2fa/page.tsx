"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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

function Verify2FAForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid verification code");
        return;
      }

      // 2FA verified — now sign in with the temporary token
      const result = await signIn("credentials", {
        email,
        password: data.tempToken,
        redirect: false,
      });

      if (result?.error) {
        setError("Failed to complete sign in");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Two-Factor Verification
        </CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
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
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense>
      <Verify2FAForm />
    </Suspense>
  );
}
