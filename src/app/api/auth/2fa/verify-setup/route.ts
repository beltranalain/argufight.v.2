import { NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import { prisma } from "@/server/db/prisma";
import speakeasy from "speakeasy";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token, secret } = await request.json();

    if (!token || !secret) {
      return NextResponse.json(
        { error: "Token and secret are required" },
        { status: 400 }
      );
    }

    const verified = speakeasy.totp.verify({
      secret,
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

    await prisma.users.update({
      where: { id: session.user.id },
      data: {
        totp_secret: secret,
        totp_enabled: true,
      },
    });

    return NextResponse.json({ message: "2FA enabled successfully" });
  } catch (error) {
    console.error("2FA verify-setup error:", error);
    return NextResponse.json(
      { error: "Failed to enable 2FA" },
      { status: 500 }
    );
  }
}
