import type { ButtonHTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl [corner-shape:squircle] border text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      intent: {
        primary:
          "bg-[color-mix(in_srgb,var(--primary)_80%,black)] [border-color:color-mix(in_srgb,var(--primary)_80%,black)] text-white hover:bg-primary hover:[border-color:var(--primary)]",
        secondary:
          "border-white/10 bg-white/5 text-foreground hover:border-primary/40 hover:bg-white/8",
        ghost:
          "border-white/10 bg-transparent text-foreground hover:border-primary/50 hover:bg-primary/8",
        danger:
          "border-danger/50 bg-danger/10 text-danger hover:border-danger hover:bg-danger/20",
        outline:
          "border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/5",
        gold:
          "[border-color:var(--gold)] bg-transparent text-[color-mix(in_srgb,var(--gold)_75%,black)] hover:[border-color:var(--gold)] hover:text-gold",
      },
      size: {
        sm: "h-10 px-4",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, intent, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ intent, size }), className)}
      {...props}
    />
  );
}
