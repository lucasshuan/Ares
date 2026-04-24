import { useTranslations } from "next-intl";
import { FaGithub } from "react-icons/fa";

export function SiteFooter() {
  const t = useTranslations("SiteFooter");
  return (
    <footer className="bg-background-soft relative border-t border-gold-dim">
      <div className="gold-hairline absolute inset-x-0 top-0 h-px" />
      <div className="text-muted mx-auto flex w-full items-center justify-between gap-4 px-6 py-6 text-xs sm:px-10 lg:px-12">
        <span className="font-display tracking-[0.25em] uppercase">
          {t("copyright")}
        </span>
        <a
          href="https://github.com/lucasshuan"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub de lucasshuan"
          className="text-gold hover:bg-gold hover:text-[#1a1208] flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors"
        >
          <FaGithub className="size-4" />
        </a>
      </div>
    </footer>
  );
}
