import { createTRPCRouter, publicProcedure } from "./init";
import { debateRouter } from "./routers/debate";
import { userRouter } from "./routers/user";
import { verdictRouter } from "./routers/verdict";
import { chatRouter } from "./routers/chat";
import { notificationRouter } from "./routers/notification";
import { messageRouter } from "./routers/message";
import { followRouter } from "./routers/follow";
import { settingsRouter } from "./routers/settings";
import { tournamentRouter } from "./routers/tournament";
import { beltRouter } from "./routers/belt";
import { coinRouter } from "./routers/coin";
import { subscriptionRouter } from "./routers/subscription";
import { adminRouter } from "./routers/admin";
import { advertiserRouter } from "./routers/advertiser";
import { creatorRouter } from "./routers/creator";
import { blogRouter } from "./routers/blog";

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
  debate: debateRouter,
  user: userRouter,
  verdict: verdictRouter,
  chat: chatRouter,
  notification: notificationRouter,
  message: messageRouter,
  follow: followRouter,
  settings: settingsRouter,
  tournament: tournamentRouter,
  belt: beltRouter,
  coin: coinRouter,
  subscription: subscriptionRouter,
  admin: adminRouter,
  advertiser: advertiserRouter,
  creator: creatorRouter,
  blog: blogRouter,
});

export type AppRouter = typeof appRouter;
