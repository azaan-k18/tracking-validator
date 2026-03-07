import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "danger" | "warning";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: BadgeVariant;
}

export function Badge({ className, variant, ...props }: BadgeProps): JSX.Element {
    const resolvedVariant = variant || "default";
    return <div className={cn("ui-badge", `ui-badge-variant-${resolvedVariant}`, className)} {...props} />;
}
