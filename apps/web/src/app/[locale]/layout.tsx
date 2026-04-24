import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteSidebar } from "@/components/layout/site-sidebar";
import { routing } from "@/i18n/routing";

import { Providers } from "@/components/providers";
import { ApolloWrapper } from "@/lib/apollo/apollo-provider";
import { getServerAuthSession } from "@/auth";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const session = await getServerAuthSession();

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ApolloWrapper>
        <Providers session={session}>
          <div className="relative flex h-screen overflow-hidden">
            <SiteSidebar />
            <div className="app-scroll-shell flex flex-1 flex-col">
              <div className="flex-1 pt-12 lg:pt-0">{children}</div>
              <SiteFooter />
            </div>
          </div>
        </Providers>
      </ApolloWrapper>
    </NextIntlClientProvider>
  );
}
