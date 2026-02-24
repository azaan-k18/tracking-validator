"use client";

import { useMemo, useState } from "react";
import type { RunRecord } from "@/lib/types";
import { MetricCard } from "@/components/MetricCard";
import { RunCard } from "@/components/RunCard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface RunsDashboardProps {
    runs: RunRecord[];
    selectedSite: string;
    onSiteChange: (site: string) => void;
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
 * Overview page dashboard content.
 *
 * @param props Overview props.
 * @returns {JSX.Element}
 */
export function RunsDashboard({ runs, selectedSite, onSiteChange }: RunsDashboardProps): JSX.Element {
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const sortedRuns = useMemo(
        () => [...runs].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()),
        [runs]
    );

    const filtered = useMemo(() => {
        return sortedRuns.filter((run) => {
            const normalized = search.trim().toLowerCase();
            const uiStatus = getUiStatus(run).toLowerCase();
            const statusMatch = statusFilter === "all" || uiStatus === statusFilter;
            const searchMatch = normalized.length === 0
                || run._id.toLowerCase().includes(normalized)
                || run.startUrl.toLowerCase().includes(normalized)
                || String(run.site || "").toLowerCase().includes(normalized);
            return statusMatch && searchMatch;
        });
    }, [search, sortedRuns, statusFilter]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);

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
        <main className="dashboard-container">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Tracking Validator Dashboard</h1>
                <p className="text-sm text-muted-foreground">Run overview, quality metrics, and drill-down insights.</p>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Total Runs" value={String(metrics.totalRuns)} />
                <MetricCard label="Latest Run Status" value={metrics.latestStatus} />
                <MetricCard label="Avg Pass Rate" value={`${metrics.avgPassRate.toFixed(1)}%`} />
                <MetricCard label="Avg Pages Crawled" value={metrics.avgPages.toFixed(1)} />
            </section>

            <section className="grid gap-3 md:grid-cols-[220px_220px_1fr]">
                <Select
                    value={selectedSite}
                    onChange={(event) => {
                        onSiteChange(event.target.value);
                        setPage(1);
                    }}
                >
                    <option value="all">All Sites</option>
                    <option value="indianexpress">indianexpress</option>
                    <option value="financialexpress">financialexpress</option>
                    <option value="loksatta">loksatta</option>
                    <option value="jansatta">jansatta</option>
                </Select>
                <Select
                    value={statusFilter}
                    onChange={(event) => {
                        setStatusFilter(event.target.value);
                        setPage(1);
                    }}
                >
                    <option value="all">All Statuses</option>
                    <option value="pass">PASS</option>
                    <option value="fail">FAIL</option>
                    <option value="running">RUNNING</option>
                </Select>
                <Input
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                    }}
                    placeholder="Search by run id, site, or start URL"
                />
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {paginated.map((run) => (
                    <RunCard key={run._id} run={run} />
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
        </main>
    );
}
