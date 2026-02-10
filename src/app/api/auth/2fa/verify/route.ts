import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import speakeasy from "speakeasy";

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token are required" },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, totp_secret: true, totp_enabled: true },
    });

    if (!user || !user.totp_enabled || !user.totp_secret) {
      return NextResponse.json(
        { error: "2FA is not enabled for this account" },
        { status: 400 }
      );
    }

    const verified = speakeasy.totp.verify({
      secret: user.totp_secret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Return success — the client will complete the sign-in
    return NextResponse.json({
      message: "2FA verified",
      verified: true,
    });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA" },
      { status: 500 }
    );
  }
}
