import NextAuth from "next-auth";
import { authConfig } from "@/server/auth/auth.config";

// Use edge-safe config (no Prisma) for middleware
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    // Protected routes requiring authentication
    "/admin/:path*",
    "/advertiser/:path*",
    "/creator/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/messages/:path*",
    "/tournaments/create",
    "/debates/saved",
    "/debates/history",
    "/upgrade",
    "/belts/room",
    "/support",
  ],
};
