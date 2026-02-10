import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ArguFight - AI-Judged Online Debate Platform",
    template: "%s | ArguFight",
  },
  description:
    "The AI-judged online debate platform. Challenge opponents, argue your case, and let AI judges deliver the verdict.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://argufight.com"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ArguFight",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
