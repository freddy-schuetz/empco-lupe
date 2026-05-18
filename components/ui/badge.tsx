import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-colors uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/15 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        high: "border-transparent bg-[hsl(var(--sev-high))]/15 text-[hsl(var(--sev-high))]",
        med: "border-transparent bg-[hsl(var(--sev-med))]/15 text-[hsl(var(--sev-med))]",
        low: "border-transparent bg-[hsl(var(--sev-low))]/15 text-[hsl(var(--sev-low))]",
        clean: "border-transparent bg-[hsl(var(--sev-clean))]/15 text-[hsl(var(--sev-clean))]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
