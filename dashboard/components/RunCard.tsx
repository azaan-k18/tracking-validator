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
            className="run-card-link"
        >
            <Card className="run-card">
                <CardHeader className="run-card-header">
                    <div className="run-card-header-top">
                        <CardTitle className="run-card-date">{formatDateTime(run.startedAt)}</CardTitle>
                        <Badge variant={state.variant}>{state.label}</Badge>
                    </div>
                    <p className="run-card-site">Site: {run.site || "unknown"}</p>
                </CardHeader>
                <CardContent className="run-card-content">
                    <div className="run-card-metric">
                        <p className="run-card-metric-label">Pages</p>
                        <p className="run-card-metric-value">{run.pagesCrawled}</p>
                    </div>
                    <div className="run-card-metric">
                        <p className="run-card-metric-label">Events</p>
                        <p className="run-card-metric-value">{run.eventsCaptured}</p>
                    </div>
                    <div className="run-card-metric">
                        <p className="run-card-metric-label">Rules Passed</p>
                        <p className="run-card-metric-value run-card-metric-success">{run.rulesPassed}</p>
                    </div>
                    <div className="run-card-metric">
                        <p className="run-card-metric-label">Rules Failed</p>
                        <p className="run-card-metric-value run-card-metric-danger">{run.rulesFailed}</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
