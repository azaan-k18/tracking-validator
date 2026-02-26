import Link from "next/link";
import type { RunRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/utils/dateFormat";

interface RunCardProps {
    run: RunRecord;
    selectedDomain: string;
    selectedEnvironment: string;
}

/**
 * Resolve UI pass/fail status for run.
 *
 * @param run Run record.
 * @returns {{label: string, variant: "success" | "danger" | "warning"}}
 */
function getRunState(run: RunRecord): { label: string; variant: "success" | "danger" | "warning" } {
    if (run.status === "running") {
        return { label: "RUNNING", variant: "warning" };
    }

    if (run.status === "failed" || run.rulesFailed > 0) {
        return { label: "FAIL", variant: "danger" };
    }

    return { label: "PASS", variant: "success" };
}

/**
 * Run summary card.
 *
 * @param props Run card props.
 * @returns {JSX.Element}
 */
export function RunCard({ run, selectedDomain, selectedEnvironment }: RunCardProps): JSX.Element {
    const state = getRunState(run);

    return (
        <Link
            href={{
                pathname: `/runs/${run._id}`,
                query: {
                    site: selectedDomain,
                    environment: selectedEnvironment
                }
            }}
            prefetch
            className="block"
        >
            <Card className="run-card">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                        <CardTitle className="line-clamp-1 text-sm font-medium text-muted-foreground">{formatDateTime(run.startedAt)}</CardTitle>
                        <Badge variant={state.variant}>{state.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Site: {run.site || "unknown"}</p>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Pages</p>
                        <p className="text-lg font-semibold">{run.pagesCrawled}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Events</p>
                        <p className="text-lg font-semibold">{run.eventsCaptured}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Rules Passed</p>
                        <p className="text-lg font-semibold text-green-250">{run.rulesPassed}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Rules Failed</p>
                        <p className="text-lg font-semibold text-red-250">{run.rulesFailed}</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
