import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
    {
        variants: {
            variant: {
                default: "bg-secondary text-secondary-foreground",
                success: "bg-success/20 text-green-250 border border-success/40",
                danger: "bg-danger/20 text-red-250 border border-danger/40",
                warning: "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            }
        },
        defaultVariants: {
            variant: "default"
        }
    }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps): JSX.Element {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
