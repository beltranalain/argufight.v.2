import type { NextAuthConfig } from "next-auth";

// Edge-safe base config — NO Prisma or Node.js-only imports
// Used by middleware (runs at Edge runtime)
export const authConfig = {
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    newUser: "/signup",
    error: "/login",
  },
  callbacks: {
    authorized({ auth }: { auth: { user?: unknown } | null }) {
      // Return true if user is authenticated, false to redirect to signIn page
      return !!auth?.user;
    },
  },
  providers: [], // Providers configured in full config (config.ts)
} satisfies NextAuthConfig;
