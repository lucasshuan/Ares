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
          className={`size-5 transition-colors ${isPending ? "text-primary animate-pulse" : "text-white/20"}`}
        />
      </div>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        className="focus:border-primary/50 focus:ring-primary/10 h-12 w-full rounded-2xl border border-white/10 bg-white/5 pr-11 pl-11 text-sm outline-hidden transition-all placeholder:text-white/20 hover:border-white/20 focus:bg-white/[0.07] focus:ring-4"
        onChange={(e) => handleSearch(e.target.value)}
      />
      {value && (
        <button
          onClick={clearSearch}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/20 hover:text-white/40"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
