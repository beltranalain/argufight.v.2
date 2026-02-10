import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractId, campaignId } = body;

    if (!contractId || !campaignId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const userAgent = hdrs.get("user-agent") ?? "unknown";
    const referrer = hdrs.get("referer") ?? null;

    await prisma.impressions.create({
      data: {
        id: crypto.randomUUID(),
        contract_id: contractId,
        campaign_id: campaignId,
        ip_address: ip,
        user_agent: userAgent,
        referrer,
      },
    });

    // Increment counter on contract
    await prisma.ad_contracts.update({
      where: { id: contractId },
      data: { impressions_delivered: { increment: 1 } },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to track impression" }, { status: 500 });
  }
}
