import { NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = speakeasy.generateSecret({
      name: `ArguFight (${session.user.email})`,
      issuer: "ArguFight",
    });

    const qrCode = await QRCode.toString(secret.otpauth_url || "", {
      type: "svg",
    });

    return NextResponse.json({
      qrCode,
      secret: secret.base32,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Failed to initialize 2FA" },
      { status: 500 }
    );
  }
}
