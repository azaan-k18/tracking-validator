"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RunDetailDashboard } from "@/components/RunDetailDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { getEvents, getPages, getRules, getRun } from "@/services/api";
import type { EventRecord, PageRecord, RuleResultRecord, RunRecord } from "@/lib/types";

/**
 * Run detail page.
 *
 * @returns {JSX.Element}
 */
export default function RunDetailPage(): JSX.Element {
    const params = useParams<{ id: string }>();
    const runId = params.id;

    const [run, setRun] = useState<RunRecord | null>(null);
    const [pages, setPages] = useState<PageRecord[]>([]);
    const [events, setEvents] = useState<EventRecord[]>([]);
    const [rules, setRules] = useState<RuleResultRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function loadData() {
            try {
                setLoading(true);
                setError(null);

                const [runData, pageData, eventData, ruleData] = await Promise.all([
                    getRun(runId),
                    getPages(runId),
                    getEvents(runId),
                    getRules(runId)
                ]);

                if (mounted) {
                    setRun(runData);
                    setPages(pageData);
                    setEvents(eventData);
                    setRules(ruleData);
                }
            } catch (loadError) {
                if (mounted) {
                    setError(loadError instanceof Error ? loadError.message : "Failed to load run details");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        if (runId) {
            loadData();
        }

        return () => {
            mounted = false;
        };
    }, [runId]);

    if (loading) {
        return (
            <main className="dashboard-container">
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">Loading run details...</CardContent>
                </Card>
            </main>
        );
    }

    if (error || !run) {
        return (
            <main className="dashboard-container">
                <Card>
                    <CardContent className="py-10 text-center text-red-300">{error || "Run not found"}</CardContent>
                </Card>
            </main>
        );
    }

    return <RunDetailDashboard run={run} pages={pages} events={events} rules={rules} />;
}
