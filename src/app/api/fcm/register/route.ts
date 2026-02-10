import { NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import { prisma } from "@/server/db/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const userId = session.user.id as string;

    // Upsert FCM token
    const existing = await prisma.fcm_tokens.findUnique({
      where: { token },
    });

    if (existing) {
      // Update if same user, ignore if different user
      if (existing.user_id === userId) {
        await prisma.fcm_tokens.update({
          where: { token },
          data: { updated_at: new Date() },
        });
      }
    } else {
      await prisma.fcm_tokens.create({
        data: {
          id: crypto.randomUUID(),
          user_id: userId,
          token,
          user_agent: req.headers.get("user-agent") ?? undefined,
          updated_at: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("FCM register error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
