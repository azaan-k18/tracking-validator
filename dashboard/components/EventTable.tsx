"use client";

import { Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { EventRecord } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getProviderDisplayName } from "@/utils/providerNames";
import { formatTime } from "@/utils/dateFormat";

interface EventTableProps {
    events: EventRecord[];
}

const PAGE_SIZE = 25;

/**
 * Paginated events table.
 *
 * @param props Event table props.
 * @returns {JSX.Element}
 */
export function EventTable({ events }: EventTableProps): JSX.Element {
    const [page, setPage] = useState(1);
    const [isUrlFilterOpen, setIsUrlFilterOpen] = useState(false);
    const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

    const uniqueUrls = useMemo(() => {
        return Array.from(new Set(events.map((event) => event.pageUrl))).sort((first, second) => first.localeCompare(second));
    }, [events]);

    const selectedUrlSet = useMemo(() => new Set(selectedUrls), [selectedUrls]);

    const filteredEvents = useMemo(() => {
        if (selectedUrlSet.size === 0) {
            return events;
        }

        return events.filter((event) => selectedUrlSet.has(event.pageUrl));
    }, [events, selectedUrlSet]);

    const pageCount = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));

    useEffect(() => {
        setPage(1);
    }, [selectedUrls]);

    const rows = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredEvents.slice(start, start + PAGE_SIZE);
    }, [filteredEvents, page]);

    const toggleUrl = (url: string) => {
        setSelectedUrls((current) => {
            const selected = new Set(current);
            if (selected.has(url)) {
                selected.delete(url);
            } else {
                selected.add(url);
            }
            return Array.from(selected);
        });
    };

    return (
        <Card className="bg-card/85">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Events</CardTitle>
                <div className="text-xs text-muted-foreground">{filteredEvents.length} total</div>
            </CardHeader>
            <CardContent className="space-y-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>
                                <div className="relative inline-flex items-center gap-2">
                                    <span>Page</span>
                                    <button
                                        type="button"
                                        className="expand-toggle"
                                        aria-label="Filter by page URL"
                                        onClick={() => setIsUrlFilterOpen((current) => !current)}
                                    >
                                        <Filter size={14} />
                                    </button>
                                    {isUrlFilterOpen ? (
                                        <div className="absolute left-0 top-6 z-20 w-[360px] rounded-xl border border-border bg-card p-3 shadow-xl">
                                            <div className="mb-2 flex items-center justify-between gap-2">
                                                <Button type="button" size="sm" variant="secondary" onClick={() => setSelectedUrls(uniqueUrls)}>
                                                    Select All
                                                </Button>
                                                <Button type="button" size="sm" variant="secondary" onClick={() => setSelectedUrls([])}>
                                                    Clear
                                                </Button>
                                            </div>
                                            <div className="max-h-60 space-y-2 overflow-auto text-xs">
                                                {uniqueUrls.map((url) => (
                                                    <label key={url} className="flex cursor-pointer items-start gap-2">
                                                        <input
                                                            type="checkbox"
                                                            className="mt-0.5"
                                                            checked={selectedUrlSet.has(url)}
                                                            onChange={() => toggleUrl(url)}
                                                        />
                                                        <span className="url-break">{url}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Params</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((event, index) => (
                            <TableRow key={`${event.pageUrl}-${event.timestamp}-${index}`}>
                                <TableCell>{formatTime(event.timestamp)}</TableCell>
                                <TableCell className="font-medium">{getProviderDisplayName(event.providerKey)}</TableCell>
                                <TableCell className="max-w-[320px] truncate">{event.pageUrl}</TableCell>
                                <TableCell>{event.accountId || "-"}</TableCell>
                                <TableCell>{event.requestType || "-"}</TableCell>
                                <TableCell>
                                    <details>
                                        <summary className="expand-toggle">View</summary>
                                        <pre className="mt-2 max-w-[260px] overflow-auto rounded-lg bg-muted/20 p-2 text-xs">
                                            {JSON.stringify(event.params, null, 2)}
                                        </pre>
                                    </details>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="flex items-center justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} / {pageCount}
                    </span>
                    <Button variant="secondary" size="sm" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={page === pageCount}>
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
