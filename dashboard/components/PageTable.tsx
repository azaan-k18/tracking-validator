"use client";

import { useState } from "react";
import type { PageRecord } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getProviderDisplayName } from "@/utils/providerNames";

interface PageTableProps {
    pages: PageRecord[];
}

/**
 * Table of crawled pages.
 *
 * @param props Page table props.
 * @returns {JSX.Element}
 */
export function PageTable({ pages }: PageTableProps): JSX.Element {
    const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({});

    return (
        <Card className="bg-card/85">
            <CardHeader>
                <CardTitle>Pages</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>URL</TableHead>
                            <TableHead>Depth</TableHead>
                            <TableHead>Events</TableHead>
                            <TableHead>Provider Counts</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pages.map((page) => {
                            const key = `${page.url}-${page.depth}`;
                            const entries = Object.entries(page.providerCounts || {});
                            const isExpanded = Boolean(expandedProviders[key]);

                            return (
                                <TableRow key={key}>
                                    <TableCell className="max-w-[460px] truncate font-medium">{page.url}</TableCell>
                                    <TableCell>{page.depth}</TableCell>
                                    <TableCell>{page.eventCount}</TableCell>
                                    <TableCell>
                                        {entries.length === 0 ? (
                                            "-"
                                        ) : (
                                            <div>
                                                <button
                                                    type="button"
                                                    className="expand-toggle"
                                                    onClick={() => {
                                                        setExpandedProviders((current) => ({
                                                            ...current,
                                                            [key]: !current[key]
                                                        }));
                                                    }}
                                                >
                                                    {isExpanded ? "Hide Providers" : "View Providers"}
                                                </button>
                                                {isExpanded ? (
                                                    <div className="provider-counts">
                                                        {entries.map(([provider, count]) => (
                                                            <div key={provider}>
                                                                {getProviderDisplayName(provider)}: {count}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
