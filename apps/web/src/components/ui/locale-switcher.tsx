"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { usePathname, useRouter, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils/helpers";
import { ChevronDown, Check } from "lucide-react";

const LOCALE_FLAGS: Record<(typeof routing.locales)[number], string> = {
  en: "fi-us",
  pt: "fi-br",
};

const LOCALE_LABELS: Record<(typeof routing.locales)[number], string> = {
  en: "English",
  pt: "Português",
};

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateCoords = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const minWidth = 160;
    const width = Math.max(rect.width, minWidth);
    const left = Math.max(
      8,
      Math.min(rect.right - width, window.innerWidth - width - 8),
    );
    setCoords({ top: rect.bottom + window.scrollY + 4, left, width });
  };

  useEffect(() => {
    if (!open) return;
    updateCoords();

    const handleClose = (e: MouseEvent) => {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    document.addEventListener("mousedown", handleClose);
    document.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
      document.removeEventListener("mousedown", handleClose);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const switchLocale = (next: (typeof routing.locales)[number]) => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next, scroll: false });
    });
    setOpen(false);
  };

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      role="listbox"
      style={{ top: coords.top, left: coords.left, width: coords.width }}
      className="bg-background/95 fixed z-9999 flex flex-col gap-0.5 overflow-hidden rounded-xl border border-white/10 p-1 shadow-2xl backdrop-blur-xl"
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          role="option"
          aria-selected={locale === l}
          onClick={() => switchLocale(l)}
          className={cn(
            "hover:bg-primary/8 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
            locale === l ? "bg-primary/10 text-foreground" : "text-muted",
          )}
        >
          <span
            className={cn("fi fis size-4 shrink-0 rounded-sm", LOCALE_FLAGS[l])}
          />
          <span className="flex-1 font-medium">{LOCALE_LABELS[l]}</span>
          {locale === l && <Check className="text-primary size-3 shrink-0" />}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "flex h-9 items-center gap-2.5 rounded-xl border border-transparent bg-transparent px-3 text-sm",
          "text-muted hover:text-foreground transition-all duration-200 hover:border-white/10 hover:bg-white/5",
          open && "text-foreground border-white/10 bg-white/5",
          "disabled:cursor-wait disabled:opacity-50",
          className,
        )}
      >
        <span
          className={cn(
            "fi size-4 shrink-0 rounded-xs",
            LOCALE_FLAGS[locale as keyof typeof LOCALE_FLAGS],
            isPending && "opacity-50",
          )}
        />
        <span className="truncate text-left text-sm">
          {LOCALE_LABELS[locale as keyof typeof LOCALE_LABELS]}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-white/35 transition-transform",
            open && "rotate-180",
            isPending && "text-primary animate-pulse",
          )}
        />
      </button>

      {typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </>
  );
}
