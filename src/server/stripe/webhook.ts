import { headers } from "next/headers";
import { stripe } from "./client";
import { prisma } from "@/server/db/prisma";
import type Stripe from "stripe";

export async function handleStripeWebhook(req: Request) {
  if (!stripe) {
    return new Response("Stripe not configured", { status: 503 });
  }

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }
  }

  return new Response("OK", { status: 200 });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const type = session.metadata?.type; // "subscription" or "coin_purchase"

  if (!userId) return;

  if (type === "coin_purchase") {
    const coins = parseInt(session.metadata?.coins ?? "0", 10);
    if (coins > 0) {
      await prisma.users.update({
        where: { id: userId },
        data: { coins: { increment: coins } },
      });
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { coins: true },
      });
      await prisma.coin_transactions.create({
        data: {
          id: crypto.randomUUID(),
          user_id: userId,
          type: "COIN_PURCHASE",
          amount: coins,
          balance_after: user?.coins ?? 0,
          description: `Purchased ${coins} coins`,
          metadata: { stripeSessionId: session.id },
          status: "COMPLETED",
          updated_at: new Date(),
        },
      });
    }
    return;
  }

  // Subscription checkout
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;
  const tier = session.metadata?.tier ?? "PRO";
  const billingCycle = session.metadata?.billingCycle ?? "MONTHLY";
  const promoCodeId = session.metadata?.promoCodeId;

  const existing = await prisma.user_subscriptions.findUnique({
    where: { user_id: userId },
  });

  if (existing) {
    await prisma.user_subscriptions.update({
      where: { user_id: userId },
      data: {
        tier,
        billingCycle,
        status: "ACTIVE",
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        current_period_start: new Date(),
        cancel_at_period_end: false,
        cancelled_at: null,
        promo_code_id: promoCodeId ?? null,
        updated_at: new Date(),
      },
    });
  } else {
    await prisma.user_subscriptions.create({
      data: {
        id: crypto.randomUUID(),
        user_id: userId,
        tier,
        billingCycle,
        status: "ACTIVE",
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        current_period_start: new Date(),
        promo_code_id: promoCodeId ?? null,
        updated_at: new Date(),
      },
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const sub = await prisma.user_subscriptions.findFirst({
    where: { stripe_subscription_id: subscription.id },
  });

  if (!sub) return;

  // Stripe v20+ uses different property shapes; safely extract period timestamps
  const subAny = subscription as unknown as Record<string, unknown>;
  const periodStart = typeof subAny.current_period_start === "number"
    ? new Date(subAny.current_period_start * 1000)
    : undefined;
  const periodEnd = typeof subAny.current_period_end === "number"
    ? new Date(subAny.current_period_end * 1000)
    : undefined;

  await prisma.user_subscriptions.update({
    where: { id: sub.id },
    data: {
      status: subscription.status === "active" ? "ACTIVE" : subscription.status === "past_due" ? "PAST_DUE" : sub.status,
      ...(periodStart ? { current_period_start: periodStart } : {}),
      ...(periodEnd ? { current_period_end: periodEnd } : {}),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date(),
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const sub = await prisma.user_subscriptions.findFirst({
    where: { stripe_subscription_id: subscription.id },
  });

  if (!sub) return;

  await prisma.user_subscriptions.update({
    where: { id: sub.id },
    data: {
      status: "CANCELLED",
      cancelled_at: new Date(),
      cancel_at_period_end: false,
      updated_at: new Date(),
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const invoiceAny = invoice as unknown as Record<string, unknown>;
  const subscriptionId = (invoiceAny.subscription as string) ?? null;
  if (!subscriptionId) return;

  const sub = await prisma.user_subscriptions.findFirst({
    where: { stripe_subscription_id: subscriptionId },
  });

  if (!sub) return;

  await prisma.user_subscriptions.update({
    where: { id: sub.id },
    data: {
      status: "PAST_DUE",
      updated_at: new Date(),
    },
  });
}
