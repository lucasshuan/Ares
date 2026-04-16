"use client";

import { useMemo, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LoginErrorHandler() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const t = useTranslations("Auth.Errors");

  const message = useMemo(() => {
    if (!error) return null;

    switch (error) {
      case "Callback":
        return t("callback");
      default:
        return t("generic");
    }
  }, [error, t]);

  if (!error || !message || dismissedError === error) {
    return null;
  }

  const handleDismiss = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    window.history.replaceState({}, "", url);
    setDismissedError(error);
  };

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-3xl items-start gap-4 rounded-3xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-left text-sm shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm",
        "text-red-50",
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="mt-0.5 rounded-full bg-red-500/20 p-2 text-red-200">
        <AlertCircle className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{t("title")}</p>
        <p className="mt-1 text-red-100/85">{message}</p>
      </div>
      <Button
        type="button"
        intent="ghost"
        size="sm"
        onClick={handleDismiss}
        className="h-9 shrink-0 border-white/10 px-3 text-red-50 hover:border-red-300/30 hover:bg-red-400/10"
        aria-label={t("dismiss")}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
