import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
    label: string;
    value: string;
    helper?: string;
    className?: string;
    valueClassName?: string;
}

/**
 * Summary metric card.
 *
 * @param props Metric card props.
 * @returns {JSX.Element}
 */
export function MetricCard({ label, value, helper, className, valueClassName }: MetricCardProps): JSX.Element {
    return (
        <Card className={cn("bg-card/80", className)}>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className={cn("text-3xl font-semibold tracking-tight", valueClassName)}>{value}</div>
                {helper ? <p className="mt-2 text-xs text-muted-foreground">{helper}</p> : null}
            </CardContent>
        </Card>
    );
}
