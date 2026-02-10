"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PublicNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-purple-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-[#00d9ff]">
              ARGU FIGHT
            </Link>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/blog"
              className={`px-3 py-2 md:px-4 md:py-2 text-sm md:text-base font-medium transition-colors ${
                pathname === "/blog"
                  ? "text-[#00d9ff]"
                  : "text-white hover:text-[#00d9ff]"
              }`}
            >
              Blog
            </Link>
            <Link
              href="/leaderboard"
              className={`px-3 py-2 md:px-4 md:py-2 text-sm md:text-base font-medium transition-colors ${
                pathname === "/leaderboard"
                  ? "text-[#00d9ff]"
                  : "text-white hover:text-[#00d9ff]"
              }`}
            >
              Leaderboard
            </Link>
            <Link
              href="/advertise"
              className={`px-3 py-2 md:px-4 md:py-2 text-sm md:text-base font-medium transition-colors ${
                pathname === "/advertise"
                  ? "text-[#00d9ff]"
                  : "text-white hover:text-[#00d9ff]"
              }`}
            >
              Advertiser
            </Link>
            <Link
              href="/login"
              className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base text-white hover:text-[#00d9ff] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 md:px-6 md:py-2 text-sm md:text-base bg-[#00d9ff] text-black rounded-lg font-semibold hover:bg-[#00B8E6] transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
