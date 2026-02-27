"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import type { EventRecord, PageRecord, RuleResultRecord, RunRecord } from "@/lib/types";
import { MetricCard } from "@/components/MetricCard";
import { RuleStatusTable } from "@/components/RuleStatusTable";
import { ProviderChart } from "@/components/ProviderChart";
import { PageTable } from "@/components/PageTable";
import { EventTable } from "@/components/EventTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/utils/dateFormat";
import { deleteRun, getRunLogs, stopRun } from "@/services/api";

interface RunDetailDashboardProps {
    run: RunRecord;
    pages: PageRecord[];
    events: EventRecord[];
    rules: RuleResultRecord[];
}

interface RunLogLine {
    timestamp: string;
    stage?: string;
    message: string;
    isError?: boolean;
    source?: string;
}

/**
 * Normalize status to RUNNING/SUCCESS/FAILED/STOPPED.
 *
 * @param status Raw status.
 * @returns {"RUNNING" | "SUCCESS" | "FAILED" | "STOPPED"}
 */
function normalizeStatus(status: string): "RUNNING" | "SUCCESS" | "FAILED" | "STOPPED" {
    const value = String(status || "").toLowerCase();
    if (value === "running") {
        return "RUNNING";
    }
    if (value === "stopped") {
        return "STOPPED";
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
    const router = useRouter();
    const [logs, setLogs] = useState<RunLogLine[]>([]);
    const [logStatus, setLogStatus] = useState<"RUNNING" | "SUCCESS" | "FAILED" | "STOPPED">(normalizeStatus(run.status));
    const [isPolling, setIsPolling] = useState(false);
    const [autoScroll, setAutoScroll] = useState(true);
    const [isStopping, setIsStopping] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastError, setToastError] = useState(false);
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
                if (response.status === "RUNNING") {
                    setLogStatus("RUNNING");
                } else if (response.status === "SUCCESS") {
                    setLogStatus("SUCCESS");
                } else if (response.status === "STOPPED") {
                    setLogStatus("STOPPED");
                } else {
                    setLogStatus("FAILED");
                }
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

    useEffect(() => {
        if (!toastMessage) {
            return undefined;
        }
        const timer = window.setTimeout(() => {
            setToastMessage(null);
        }, 3500);
        return () => {
            window.clearTimeout(timer);
        };
    }, [toastMessage]);

    const handleStopBuild = async () => {
        if (logStatus !== "RUNNING") {
            return;
        }
        const confirmed = window.confirm("Stop currently running build?");
        if (!confirmed) {
            return;
        }

        try {
            setIsStopping(true);
            await stopRun(run._id);
            setLogStatus("STOPPED");
            setToastError(false);
            setToastMessage("Build stopped successfully.");
            const response = await getRunLogs(run._id, run.site, run.environment, 500);
            setLogs(response.logs || []);
        } catch (error) {
            const message = axios.isAxiosError(error) ? String(error.response?.data?.error || error.message) : "Failed to stop build.";
            setToastError(true);
            setToastMessage(message);
        } finally {
            setIsStopping(false);
        }
    };

    const handleDeleteRun = async () => {
        const confirmed = window.confirm("This will permanently delete build data.");
        if (!confirmed) {
            return;
        }

        try {
            setIsDeleting(true);
            await deleteRun(run._id);
            router.push("/");
            router.refresh();
        } catch (error) {
            const message = axios.isAxiosError(error) ? String(error.response?.data?.error || error.message) : "Failed to delete run.";
            setToastError(true);
            setToastMessage(message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <main className="dashboard-container">
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Run Detail</h1>
                        <p className="text-sm text-muted-foreground">Run ID: {run._id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {logStatus === "RUNNING" ? (
                            <Button variant="secondary" size="sm" onClick={handleStopBuild} disabled={isStopping}>
                                {isStopping ? "Stopping..." : "Stop Build"}
                            </Button>
                        ) : null}
                        <Button variant="secondary" size="sm" className="border border-red-500/40 text-red-300 hover:bg-red-500/20" onClick={handleDeleteRun} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete Run"}
                        </Button>
                        <Link href="/">
                            <Button variant="secondary" size="sm">Back to Home</Button>
                        </Link>
                    </div>
                </div>
                {toastMessage ? (
                    <div className={`rounded-xl border px-3 py-2 text-sm ${toastError ? "border-red-500/50 bg-red-500/10 text-red-200" : "border-green-500/50 bg-green-500/10 text-green-200"}`}>
                        {toastMessage}
                    </div>
                ) : null}
            </div>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Started At" value={formatDateTime(run.startedAt)} valueClassName="text-base" />
                <MetricCard
                    label="Status"
                    value={logStatus}
                    helper={logStatus === "RUNNING" ? "Build in progress" : ""}
                    valueClassName="text-xl"
                />
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
                        <Badge variant={logStatus === "SUCCESS" ? "success" : logStatus === "RUNNING" ? "warning" : logStatus === "STOPPED" ? "default" : "danger"}>
                            {logStatus}
                        </Badge>
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
                                    {line.stage ? <span className="mr-2 text-cyan-300">[{line.stage}]</span> : null}
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
