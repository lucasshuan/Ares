import { cn } from "@/lib/utils/helpers";

interface GlowBorderProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  borderClassName?: string;
}

export function GlowBorder({
  children,
  className,
  innerClassName,
  borderClassName,
}: GlowBorderProps) {
  return (
    <div
      className={cn(
        "bg-border p-px shadow-[0_4px_24px_rgb(0_0_0/0.25)]",
        className,
        borderClassName,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-[linear-gradient(180deg,var(--background-soft),var(--background))]",
          className,
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
