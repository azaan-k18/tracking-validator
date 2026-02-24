"use client";

import { useMemo, useState } from "react";
import type { EventRecord } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getProviderDisplayName } from "@/utils/providerNames";

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
    const pageCount = Math.max(1, Math.ceil(events.length / PAGE_SIZE));

    const rows = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return events.slice(start, start + PAGE_SIZE);
    }, [events, page]);

    return (
        <Card className="bg-card/85">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Events</CardTitle>
                <div className="text-xs text-muted-foreground">{events.length} total</div>
            </CardHeader>
            <CardContent className="space-y-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Page</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Params</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((event, index) => (
                            <TableRow key={`${event.pageUrl}-${event.timestamp}-${index}`}>
                                <TableCell>{new Date(event.timestamp).toLocaleTimeString()}</TableCell>
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
