import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: "If an account exists, a reset email has been sent" });
    }

    // Generate reset token and store in password_reset_tokens table
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.password_reset_tokens.create({
      data: {
        id: crypto.randomUUID(),
        email: user.email,
        token: resetToken,
        expires_at: expiresAt,
      },
    });

    // TODO: Send email via Resend in Phase 4
    // For now, log the token in development
    if (process.env.NODE_ENV === "development") {
      console.log(`Password reset token for ${email}: ${resetToken}`);
    }

    return NextResponse.json({ message: "If an account exists, a reset email has been sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
