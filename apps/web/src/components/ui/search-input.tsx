"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 250;

export function SearchInput({
  defaultValue = "",
  placeholder,
  className,
}: {
  defaultValue?: string;
  placeholder: string;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const currentSearch = searchParams.get("search") ?? "";

    if (value === currentSearch) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }

      startTransition(() => {
        router.replace(`?${params.toString()}`, { scroll: false });
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [router, searchParams, startTransition, value]);

  function handleSearch(term: string) {
    setValue(term);
  }

  function clearSearch() {
    const params = new URLSearchParams(searchParams);

    params.delete("search");
    setValue("");

    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Search
          className={`size-4 transition-colors ${isPending ? "text-gold animate-pulse" : "text-muted/50"}`}
        />
      </div>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        className="focus:border-gold/45 focus:ring-gold/10 h-11 w-full rounded-xl border border-gold-dim/35 bg-card-strong/50 pr-11 pl-10 text-sm text-secondary outline-hidden transition-all placeholder:text-secondary/30 hover:border-gold-dim/55 focus:bg-card-strong/70 focus:ring-4"
        onChange={(e) => handleSearch(e.target.value)}
      />
      {value && (
        <button
          onClick={clearSearch}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted/40 hover:text-muted"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
