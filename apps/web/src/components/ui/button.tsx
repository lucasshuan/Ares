import type { ButtonHTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/helpers";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl [corner-shape:squircle] border text-sm font-medium transition-all cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      intent: {
        primary:
          "border-primary/60 bg-gradient-to-b from-primary to-primary-strong text-white shadow-[0_1px_0_0_color-mix(in_srgb,var(--gold)_40%,transparent)_inset,0_6px_16px_-6px_color-mix(in_srgb,var(--primary)_70%,transparent)] hover:border-gold/50 hover:shadow-[0_1px_0_0_color-mix(in_srgb,var(--gold)_70%,transparent)_inset,0_8px_22px_-6px_color-mix(in_srgb,var(--primary)_85%,transparent)]",
        secondary:
          "border-gold-dim/40 bg-card-strong/50 text-secondary hover:border-gold/45 hover:bg-card-strong/75 hover:text-foreground",
        ghost:
          "border-gold-dim/25 bg-transparent text-secondary/80 hover:border-gold-dim/55 hover:bg-primary/8 hover:text-foreground",
        danger:
          "border-danger/50 bg-danger/10 text-danger hover:border-danger hover:bg-danger/20",
        outline:
          "border-gold-dim/40 bg-transparent text-secondary/90 hover:border-gold/40 hover:bg-gold/5 hover:text-foreground",
        gold: "border-gold/50 bg-gradient-to-b from-gold/10 to-gold-dim/15 text-gold hover:border-gold hover:from-gold/20 hover:to-gold-dim/25 hover:text-foreground",
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
