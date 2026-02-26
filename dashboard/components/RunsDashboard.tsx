"use client";

import { useEffect, useMemo, useState } from "react";
import type { RunRecord } from "@/lib/types";
import { MetricCard } from "@/components/MetricCard";
import { RunCard } from "@/components/RunCard";
import { Button } from "@/components/ui/button";

interface RunsDashboardProps {
    runs: RunRecord[];
    selectedDomain: string;
    selectedEnvironment: string;
}

const PAGE_SIZE = 20;

/**
 * Resolve UI pass/fail/running status for a run.
 *
 * @param run Run record.
 * @returns {"PASS" | "FAIL" | "RUNNING"}
 */
function getUiStatus(run: RunRecord): "PASS" | "FAIL" | "RUNNING" {
    if (run.status === "running") {
        return "RUNNING";
    }

    if (run.status === "failed" || run.rulesFailed > 0) {
        return "FAIL";
    }

    return "PASS";
}

/**
 * Runs overview dashboard.
 *
 * @param props Dashboard props.
 * @returns {JSX.Element}
 */
export function RunsDashboard({ runs, selectedDomain, selectedEnvironment }: RunsDashboardProps): JSX.Element {
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [selectedDomain, selectedEnvironment]);

    const sortedRuns = useMemo(
        () => [...runs].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()),
        [runs]
    );

    const pageCount = Math.max(1, Math.ceil(sortedRuns.length / PAGE_SIZE));
    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return sortedRuns.slice(start, start + PAGE_SIZE);
    }, [sortedRuns, page]);

    const metrics = useMemo(() => {
        const totalRuns = sortedRuns.length;
        const latest = sortedRuns[0];
        const avgPassRate = totalRuns > 0
            ? sortedRuns.reduce((acc, run) => {
                const total = run.rulesPassed + run.rulesFailed;
                if (total === 0) {
                    return acc;
                }
                return acc + (run.rulesPassed / total) * 100;
            }, 0) / totalRuns
            : 0;
        const avgPages = totalRuns > 0
            ? sortedRuns.reduce((acc, run) => acc + run.pagesCrawled, 0) / totalRuns
            : 0;

        return {
            totalRuns,
            latestStatus: latest ? getUiStatus(latest) : "-",
            avgPassRate,
            avgPages
        };
    }, [sortedRuns]);

    return (
        <>
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Domain: {selectedDomain} | Environment: {selectedEnvironment}</p>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Total Runs" value={String(metrics.totalRuns)} />
                <MetricCard label="Latest Run Status" value={metrics.latestStatus} />
                <MetricCard label="Avg Pass Rate" value={`${metrics.avgPassRate.toFixed(1)}%`} />
                <MetricCard label="Avg Pages Crawled" value={metrics.avgPages.toFixed(1)} />
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {paginated.map((run) => (
                    <RunCard
                        key={run._id}
                        run={run}
                        selectedDomain={selectedDomain}
                        selectedEnvironment={selectedEnvironment}
                    />
                ))}
            </section>

            <section className="flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {page} / {pageCount}
                </span>
                <Button variant="secondary" size="sm" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={page === pageCount}>
                    Next
                </Button>
            </section>
        </>
    );
}
