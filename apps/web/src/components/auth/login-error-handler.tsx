"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function LoginErrorHandler() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const t = useTranslations("Auth.Errors");
  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!error || lastErrorRef.current === error) return;

    let message = "";
    switch (error) {
      case "Callback":
        message = t("callback");
        break;
      default:
        message = t("generic");
    }

    toast.error(t("title"), {
      description: message,
    });

    // Clear the error parameter from the URL
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    window.history.replaceState({}, "", url);

    lastErrorRef.current = error;
  }, [error, t]);

  return null;
}
