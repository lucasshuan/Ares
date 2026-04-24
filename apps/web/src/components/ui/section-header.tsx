import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="space-y-1.5">
        {eyebrow && (
          <p className="text-primary/90 font-mono text-xs font-medium tracking-[0.35em] uppercase">
            {eyebrow}
          </p>
        )}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-foreground text-xl font-bold tracking-[0.06em] uppercase sm:text-2xl">
                {title}
              </h2>
              <div className="bg-primary h-px w-8 shrink-0 rounded-full" />
            </div>
            {actions && (
              <div className="flex shrink-0 items-center gap-4">{actions}</div>
            )}
          </div>
          {description && (
            <div className="text-muted/60 max-w-3xl text-sm leading-relaxed sm:text-base">
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
