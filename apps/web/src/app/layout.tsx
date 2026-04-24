import type { Metadata } from "next";

import { getLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Cinzel, Barlow } from "next/font/google";

import { env } from "@/env";
import { routing } from "@/i18n/routing";

import "./globals.css";
import "flag-icons/css/flag-icons.min.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const metadataBaseUrl =
  env.NEXTAUTH_URL ??
  env.NEXT_PUBLIC_APP_URL ??
  (env.NODE_ENV === "development" ? "http://localhost:3000" : null);

if (!metadataBaseUrl) {
  throw new Error(
    "Missing site URL environment variable. Set NEXTAUTH_URL or NEXT_PUBLIC_APP_URL.",
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: {
    default: "Bellona",
    template: "%s | Bellona",
  },
  description: "Plataforma de ligas e torneios para jogos.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Bellona",
    description: "Plataforma de ligas e torneios para jogos.",
    images: [
      {
        url: "/logo.png",
        alt: "Bellona",
        width: 120,
        height: 120,
        type: "image/png",
      },
    ],
  },
};

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale().catch(() => routing.defaultLocale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${cinzel.variable} ${barlow.variable}`}
    >
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
