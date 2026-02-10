import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";
import { authConfig } from "./auth.config";

// Full auth config with Prisma — used in server components, API routes, tRPC
// Middleware uses the edge-safe auth.config.ts instead
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.users.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.password_hash) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        if (user.is_banned) {
          throw new Error("Account is banned");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          image: user.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Handle Google OAuth — create or link user
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.users.findUnique({
          where: { email: user.email.toLowerCase() },
        });

        if (!existingUser) {
          const username =
            user.name?.replace(/\s+/g, "_").toLowerCase() ||
            user.email.split("@")[0];

          let finalUsername = username;
          let counter = 1;
          while (
            await prisma.users.findUnique({
              where: { username: finalUsername },
            })
          ) {
            finalUsername = `${username}${counter}`;
            counter++;
          }

          await prisma.users.create({
            data: {
              id: crypto.randomUUID(),
              email: user.email.toLowerCase(),
              username: finalUsername,
              google_id: account.providerAccountId,
              google_email: user.email,
              avatar_url: user.image,
              elo_rating: 1200,
              coins: 0,
              updated_at: new Date(),
            },
          });
        } else if (!existingUser.google_id) {
          await prisma.users.update({
            where: { id: existingUser.id },
            data: {
              google_id: account.providerAccountId,
              google_email: user.email,
              avatar_url: existingUser.avatar_url || user.image,
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google" && user.email) {
          const dbUser = await prisma.users.findUnique({
            where: { email: user.email.toLowerCase() },
          });
          if (dbUser) {
            token.id = dbUser.id;
          }
        } else {
          token.id = user.id;
        }
      }

      if (token.id) {
        const dbUser = await prisma.users.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            email: true,
            username: true,
            avatar_url: true,
            is_admin: true,
            elo_rating: true,
            coins: true,
            is_creator: true,
            is_banned: true,
            totp_enabled: true,
          },
        });
        if (dbUser) {
          token.isAdmin = dbUser.is_admin;
          token.username = dbUser.username;
          token.avatarUrl = dbUser.avatar_url;
          token.eloRating = dbUser.elo_rating;
          token.coins = dbUser.coins;
          token.isCreator = dbUser.is_creator;
          token.totpEnabled = dbUser.totp_enabled;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = (token.isAdmin as boolean) ?? false;
        session.user.username = (token.username as string) ?? "";
        session.user.avatarUrl = (token.avatarUrl as string | null) ?? null;
        session.user.eloRating = (token.eloRating as number) ?? 1200;
        session.user.coins = (token.coins as number) ?? 0;
        session.user.isCreator = (token.isCreator as boolean) ?? false;
        session.user.totpEnabled = (token.totpEnabled as boolean) ?? false;
      }
      return session;
    },
  },
});
