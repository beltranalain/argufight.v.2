"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/advertise", label: "Advertise" },
];

export function PublicNav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 text-xl font-bold">
          <span className="text-electric-blue">ARGU</span>
          <span className="text-neon-orange">FIGHT</span>
        </Link>

        {/* Center Links (hidden on mobile) */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-electric-blue ${
                pathname === link.href
                  ? "text-electric-blue"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button
            size="sm"
            className="bg-electric-blue text-black hover:bg-electric-blue/90"
            asChild
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
