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
            <div className="run-detail-header-wrap">
                <div className="run-detail-header-row">
                    <div className="run-detail-header-title-wrap">
                        <h1 className="run-detail-title">Run Detail</h1>
                        <p className="run-detail-subtitle">Run ID: {run._id}</p>
                    </div>
                    <div className="run-detail-action-row">
                        {logStatus === "RUNNING" ? (
                            <Button variant="secondary" size="sm" onClick={handleStopBuild} disabled={isStopping}>
                                {isStopping ? "Stopping..." : "Stop Build"}
                            </Button>
                        ) : null}
                        <Button variant="secondary" size="sm" className="run-delete-button" onClick={handleDeleteRun} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete Run"}
                        </Button>
                        <Link href="/">
                            <Button variant="secondary" size="sm">Back to Home</Button>
                        </Link>
                    </div>
                </div>
                {toastMessage ? (
                    <div className={`run-detail-toast ${toastError ? "run-detail-toast-error" : "run-detail-toast-success"}`}>
                        {toastMessage}
                    </div>
                ) : null}
            </div>

            <section className="run-detail-metrics-grid">
                <MetricCard label="Started At" value={formatDateTime(run.startedAt)} valueClassName="metric-card-value-base" />
                <MetricCard
                    label="Status"
                    value={logStatus}
                    helper={logStatus === "RUNNING" ? "Build in progress" : ""}
                    valueClassName="metric-card-value-large"
                />
                <MetricCard label="Pages Crawled" value={String(run.pagesCrawled)} />
                <MetricCard label="Events Captured" value={String(run.eventsCaptured)} />
            </section>

            <section className="run-detail-metrics-grid">
                <MetricCard label="Rules Passed" value={String(run.rulesPassed)} />
                <MetricCard label="Rules Failed" value={String(run.rulesFailed)} />
                <MetricCard label="Start URL" value={run.startUrl} valueClassName="url-break metric-card-value-small" />
                <MetricCard label="Finished At" value={formatDateTime(run.finishedAt)} valueClassName="metric-card-value-base" />
            </section>

            <RuleStatusTable rules={rules} />
            <ProviderChart data={providerData} />
            <PageTable pages={pages} />
            <EventTable events={events} />

            <section className="run-log-section">
                <div className="run-log-toolbar">
                    <div className="run-log-toolbar-left">
                        <h2 className="run-log-title">Live Build Logs</h2>
                        <Badge variant={logStatus === "SUCCESS" ? "success" : logStatus === "RUNNING" ? "warning" : logStatus === "STOPPED" ? "default" : "danger"}>
                            {logStatus}
                        </Badge>
                        {isPolling ? (
                            <span className="run-log-polling-status">
                                <span className="run-log-spinner" />
                                <span>Polling...</span>
                            </span>
                        ) : null}
                    </div>
                    <label className="run-log-autoscroll-label">
                        <input type="checkbox" checked={autoScroll} onChange={(event) => setAutoScroll(event.target.checked)} />
                        <span>Auto-scroll</span>
                    </label>
                </div>
                <div ref={logContainerRef} className="run-log-panel">
                    {logs.length === 0 ? (
                        <div className="run-log-empty">No logs available yet.</div>
                    ) : (
                        <div className="run-log-lines">
                            {logs.map((line, index) => (
                                <div key={`${line.timestamp}-${index}`} className={line.isError ? "run-log-line run-log-line-error" : "run-log-line"}>
                                    <span className="run-log-time">[{formatDateTime(line.timestamp)}]</span>
                                    {line.stage ? <span className="run-log-stage">[{line.stage}]</span> : null}
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
