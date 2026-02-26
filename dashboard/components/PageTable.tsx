"use client";

import { useMemo, useState } from "react";
import type { PageRecord } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getProviderDisplayName } from "@/utils/providerNames";

interface PageTableProps {
    pages: PageRecord[];
}

type UrlFilter = "all" | "section" | "article";

/**
 * Table of crawled pages.
 *
 * @param props Page table props.
 * @returns {JSX.Element}
 */
export function PageTable({ pages }: PageTableProps): JSX.Element {
    const [isOpen, setIsOpen] = useState(false);
    const [urlFilter, setUrlFilter] = useState<UrlFilter>("all");
    const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({});

    const sectionCount = useMemo(() => {
        return pages.filter((page) => page.url.includes("/section/")).length;
    }, [pages]);

    const articleCount = useMemo(() => {
        return pages.filter((page) => page.url.includes("/article/")).length;
    }, [pages]);

    const filteredPages = useMemo(() => {
        if (urlFilter === "section") {
            return pages.filter((page) => page.url.includes("/section/"));
        }

        if (urlFilter === "article") {
            return pages.filter((page) => page.url.includes("/article/"));
        }

        return pages;
    }, [pages, urlFilter]);

    return (
        <Card className="bg-card/85">
            <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle>Pages</CardTitle>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setIsOpen((current) => !current)}>
                        {isOpen ? "Hide Pages" : "Show Pages"}
                    </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant={urlFilter === "all" ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setUrlFilter("all")}
                    >
                        All ({pages.length})
                    </Button>
                    <Button
                        type="button"
                        variant={urlFilter === "section" ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setUrlFilter("section")}
                    >
                        Section ({sectionCount})
                    </Button>
                    <Button
                        type="button"
                        variant={urlFilter === "article" ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setUrlFilter("article")}
                    >
                        Article ({articleCount})
                    </Button>
                </div>
            </CardHeader>
            <CardContent className={`transition-all duration-200 ${isOpen ? "max-h-[1800px] opacity-100" : "max-h-0 overflow-hidden p-0 opacity-0"}`}>
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
                        {filteredPages.map((page) => {
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
