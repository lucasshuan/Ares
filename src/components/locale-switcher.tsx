"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

export function LocaleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("LocaleSwitcher");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        aria-label={t("label")}
      >
        <Languages className="h-5 w-5 text-white/80" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#1e1e1e] p-2 shadow-xl z-50">
          <div className="px-2 py-1.5 text-sm font-semibold text-white/70">
            {t("label")}
          </div>
          <div className="h-px w-full bg-white/10 my-1"></div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => switchLocale("en")}
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-white/5 ${
                locale === "en" ? "bg-white/10 text-white" : "text-white/80"
              }`}
            >
              <span className="text-base leading-none block">🇺🇸</span>
              <span>{t("en")}</span>
            </button>
            <button
              onClick={() => switchLocale("pt")}
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-white/5 ${
                locale === "pt" ? "bg-white/10 text-white" : "text-white/80"
              }`}
            >
              <span className="text-base leading-none block">🇧🇷</span>
              <span>{t("pt")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
