import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/server/auth/config";
import { prisma } from "@/server/db/prisma";
import superjson from "superjson";
import { ZodError } from "zod";

export const createTRPCContext = async () => {
  const session = await auth();

  return {
    session,
    prisma,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  // Check admin status - will be validated against DB
  if (!(ctx.session.user as { isAdmin?: boolean }).isAdmin) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});
