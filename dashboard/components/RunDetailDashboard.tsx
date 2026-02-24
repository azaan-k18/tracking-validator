"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { EventRecord, PageRecord, RuleResultRecord, RunRecord } from "@/lib/types";
import { MetricCard } from "@/components/MetricCard";
import { RuleStatusTable } from "@/components/RuleStatusTable";
import { ProviderChart } from "@/components/ProviderChart";
import { PageTable } from "@/components/PageTable";
import { EventTable } from "@/components/EventTable";
import { Button } from "@/components/ui/button";

interface RunDetailDashboardProps {
    run: RunRecord;
    pages: PageRecord[];
    events: EventRecord[];
    rules: RuleResultRecord[];
}

/**
 * Run detail dashboard content.
 *
 * @param props Run detail props.
 * @returns {JSX.Element}
 */
export function RunDetailDashboard({ run, pages, events, rules }: RunDetailDashboardProps): JSX.Element {
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
                <MetricCard label="Started At" value={new Date(run.startedAt).toLocaleString()} />
                <MetricCard label="Status" value={run.status.toUpperCase()} />
                <MetricCard label="Pages Crawled" value={String(run.pagesCrawled)} />
                <MetricCard label="Events Captured" value={String(run.eventsCaptured)} />
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Rules Passed" value={String(run.rulesPassed)} />
                <MetricCard label="Rules Failed" value={String(run.rulesFailed)} />
                <MetricCard label="Start URL" value={run.startUrl} valueClassName="url-break text-sm" />
                <MetricCard label="Finished At" value={run.finishedAt ? new Date(run.finishedAt).toLocaleString() : "-"} />
            </section>

            <RuleStatusTable rules={rules} />
            <ProviderChart data={providerData} />
            <PageTable pages={pages} />
            <EventTable events={events} />
        </main>
    );
}
