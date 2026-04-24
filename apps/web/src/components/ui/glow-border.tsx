import { cn } from "@/lib/utils";

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
        "bg-border p-px shadow-[0_18px_80px_rgb(0_0_0/0.35)]",
        className,
        borderClassName,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-[linear-gradient(180deg,rgb(20_13_22),rgb(11_8_15))]",
          className,
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
