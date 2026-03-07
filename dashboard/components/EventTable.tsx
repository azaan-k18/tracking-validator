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
        <Card className="event-table-card">
            <CardHeader className="event-table-header">
                <CardTitle>Events</CardTitle>
                <div className="event-table-total">{filteredEvents.length} total</div>
            </CardHeader>
            <CardContent className="event-table-content">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>
                                <div className="event-url-filter">
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
                                        <div className="event-url-dropdown">
                                            <div className="event-url-dropdown-actions">
                                                <Button type="button" size="sm" variant="secondary" onClick={() => setSelectedUrls(uniqueUrls)}>
                                                    Select All
                                                </Button>
                                                <Button type="button" size="sm" variant="secondary" onClick={() => setSelectedUrls([])}>
                                                    Clear
                                                </Button>
                                            </div>
                                            <div className="event-url-dropdown-list">
                                                {uniqueUrls.map((url) => (
                                                    <label key={url} className="event-url-option">
                                                        <input
                                                            type="checkbox"
                                                            className="event-url-checkbox"
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
                                    <TableCell className="event-provider-cell">{getProviderDisplayName(event.providerKey)}</TableCell>
                                    <TableCell className="event-page-cell">{event.pageUrl}</TableCell>
                                <TableCell>{event.accountId || "-"}</TableCell>
                                <TableCell>{event.requestType || "-"}</TableCell>
                                <TableCell>
                                    <details>
                                        <summary className="expand-toggle">View</summary>
                                        <pre className="event-params-pre">
                                            {JSON.stringify(event.params, null, 2)}
                                        </pre>
                                    </details>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="event-pagination">
                    <Button variant="secondary" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>
                        Previous
                    </Button>
                    <span className="event-pagination-label">
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
