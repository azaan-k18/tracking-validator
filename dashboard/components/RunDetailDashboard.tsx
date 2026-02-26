"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { EventRecord, PageRecord, RuleResultRecord, RunRecord } from "@/lib/types";
import { MetricCard } from "@/components/MetricCard";
import { RuleStatusTable } from "@/components/RuleStatusTable";
import { ProviderChart } from "@/components/ProviderChart";
import { PageTable } from "@/components/PageTable";
import { EventTable } from "@/components/EventTable";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/utils/dateFormat";
import { getRunLogs } from "@/services/api";

interface RunDetailDashboardProps {
    run: RunRecord;
    pages: PageRecord[];
    events: EventRecord[];
    rules: RuleResultRecord[];
}

interface RunLogLine {
    timestamp: string;
    message: string;
    isError?: boolean;
    source?: string;
}

/**
 * Normalize status to RUNNING/SUCCESS/FAILED.
 *
 * @param status Raw status.
 * @returns {"RUNNING" | "SUCCESS" | "FAILED"}
 */
function normalizeStatus(status: string): "RUNNING" | "SUCCESS" | "FAILED" {
    const value = String(status || "").toLowerCase();
    if (value === "running") {
        return "RUNNING";
    }
    if (value === "completed") {
        return "SUCCESS";
    }
    if (value === "success") {
        return "SUCCESS";
    }
    return "FAILED";
}

/**
 * Run detail dashboard content.
 *
 * @param props Run detail props.
 * @returns {JSX.Element}
 */
export function RunDetailDashboard({ run, pages, events, rules }: RunDetailDashboardProps): JSX.Element {
    const [logs, setLogs] = useState<RunLogLine[]>([]);
    const [logStatus, setLogStatus] = useState<"RUNNING" | "SUCCESS" | "FAILED">(normalizeStatus(run.status));
    const [isPolling, setIsPolling] = useState(false);
    const [autoScroll, setAutoScroll] = useState(true);
    const logContainerRef = useRef<HTMLDivElement | null>(null);
    const pollingInFlightRef = useRef(false);

    const providerData = useMemo(() => {
        const counts = events.reduce<Record<string, number>>((accumulator, event) => {
            accumulator[event.providerKey] = (accumulator[event.providerKey] || 0) + 1;
            return accumulator;
        }, {});

        return Object.entries(counts).map(([provider, count]) => ({
            provider,
            count
        }));
    }, [events]);

    useEffect(() => {
        let cancelled = false;

        const loadLogs = async () => {
            if (pollingInFlightRef.current) {
                return;
            }

            try {
                pollingInFlightRef.current = true;
                setIsPolling(true);
                const response = await getRunLogs(run._id, run.site, run.environment, 500);
                if (cancelled) {
                    return;
                }
                setLogs(response.logs || []);
                setLogStatus(response.status === "RUNNING" ? "RUNNING" : response.status === "SUCCESS" ? "SUCCESS" : "FAILED");
            } catch {
                // Keep dashboard stable if logs endpoint is temporarily unavailable.
            } finally {
                pollingInFlightRef.current = false;
                if (!cancelled) {
                    setIsPolling(false);
                }
            }
        };

        loadLogs();

        let intervalId: ReturnType<typeof setInterval> | null = null;
        if (logStatus === "RUNNING") {
            intervalId = setInterval(() => {
                loadLogs();
            }, 2000);
        }

        return () => {
            cancelled = true;
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [run._id, run.site, run.environment, logStatus]);

    useEffect(() => {
        if (!autoScroll || !logContainerRef.current) {
            return;
        }

        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }, [logs, autoScroll]);

    return (
        <main className="dashboard-container">
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Run Detail</h1>
                        <p className="text-sm text-muted-foreground">Run ID: {run._id}</p>
                    </div>
                    <Link href="/">
                        <Button variant="secondary" size="sm">Back to Home</Button>
                    </Link>
                </div>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Started At" value={formatDateTime(run.startedAt)} valueClassName="text-base" />
                <MetricCard label="Status" value={run.status.toUpperCase()} />
                <MetricCard label="Pages Crawled" value={String(run.pagesCrawled)} />
                <MetricCard label="Events Captured" value={String(run.eventsCaptured)} />
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Rules Passed" value={String(run.rulesPassed)} />
                <MetricCard label="Rules Failed" value={String(run.rulesFailed)} />
                <MetricCard label="Start URL" value={run.startUrl} valueClassName="url-break text-sm" />
                <MetricCard label="Finished At" value={formatDateTime(run.finishedAt)} valueClassName="text-base" />
            </section>

            <RuleStatusTable rules={rules} />
            <ProviderChart data={providerData} />
            <PageTable pages={pages} />
            <EventTable events={events} />

            <section className="space-y-3 rounded-2xl border border-border bg-card/85 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold">Live Build Logs</h2>
                        <span className="text-xs text-muted-foreground">Status: {logStatus}</span>
                        {isPolling ? (
                            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                <span>Polling...</span>
                            </span>
                        ) : null}
                    </div>
                    <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <input type="checkbox" checked={autoScroll} onChange={(event) => setAutoScroll(event.target.checked)} />
                        <span>Auto-scroll</span>
                    </label>
                </div>
                <div ref={logContainerRef} className="max-h-[300px] overflow-auto rounded-xl border border-border bg-black p-3 font-mono text-xs text-green-200">
                    {logs.length === 0 ? (
                        <div className="text-gray-400">No logs available yet.</div>
                    ) : (
                        <div className="space-y-1">
                            {logs.map((line, index) => (
                                <div key={`${line.timestamp}-${index}`} className={line.isError ? "text-red-400" : "text-green-200"}>
                                    <span className="mr-2 text-gray-400">[{formatDateTime(line.timestamp)}]</span>
                                    <span>{line.message}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
