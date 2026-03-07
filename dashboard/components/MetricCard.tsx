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
        <Card className={cn("metric-card", className)}>
            <CardHeader className="metric-card-header">
                <CardTitle className="metric-card-label">{label}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className={cn("metric-card-value", valueClassName)}>{value}</div>
                {helper ? <p className="metric-card-helper">{helper}</p> : null}
            </CardContent>
        </Card>
    );
}
