import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("SiteFooter");
  return (
    <footer className="border-t border-white/6">
      <div className="text-muted mx-auto w-full max-w-7xl px-6 py-6 text-xs sm:px-10 lg:px-12">
        {t("copyright")}
      </div>
    </footer>
  );
}
