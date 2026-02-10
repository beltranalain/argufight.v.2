import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Look up token in password_reset_tokens table
    const resetRecord = await prisma.password_reset_tokens.findUnique({
      where: { token },
    });

    if (!resetRecord || resetRecord.expires_at < new Date() || resetRecord.used_at) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
      where: { email: resetRecord.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.users.update({
        where: { id: user.id },
        data: { password_hash: passwordHash },
      }),
      prisma.password_reset_tokens.update({
        where: { id: resetRecord.id },
        data: { used_at: new Date() },
      }),
    ]);

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
