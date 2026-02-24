"use client";

import { useState } from "react";
import type { RuleResultRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getProviderDisplayName } from "@/utils/providerNames";

interface RuleStatusTableProps {
    rules: RuleResultRecord[];
}

/**
 * Extract URLs from a missing-on details string.
 *
 * @param details Rule details text.
 * @returns {string[]}
 */
function parseMissingUrls(details: string): string[] {
    if (!details.startsWith("Missing on:")) {
        return [];
    }

    return details
        .replace("Missing on:", "")
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
}

/**
 * Table of rule results.
 *
 * @param props Rule table props.
 * @returns {JSX.Element}
 */
export function RuleStatusTable({ rules }: RuleStatusTableProps): JSX.Element {
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    return (
        <Card className="rule-table">
            <CardHeader>
                <CardTitle>Rule Results</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Provider</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rules.map((rule) => {
                            const key = `${rule.ruleId}-${rule._id || ""}`;
                            const missingUrls = parseMissingUrls(rule.details);
                            const isExpanded = Boolean(expandedRows[key]);
                            const showExpandable = missingUrls.length > 1;

                            return (
                                <TableRow key={key} data-rule-id={rule.ruleId}>
                                    <TableCell className="font-medium">{getProviderDisplayName(rule.provider)}</TableCell>
                                    <TableCell>
                                        <Badge variant={rule.passed ? "success" : "danger"}>{rule.passed ? "PASS" : "FAIL"}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {showExpandable ? (
                                            <div className="space-y-2">
                                                <button
                                                    type="button"
                                                    className="expand-toggle"
                                                    onClick={() => {
                                                        setExpandedRows((current) => ({
                                                            ...current,
                                                            [key]: !current[key]
                                                        }));
                                                    }}
                                                >
                                                    {isExpanded ? "Hide" : `View (${missingUrls.length} URLs)`}
                                                </button>
                                                {isExpanded ? (
                                                    <div className="provider-counts">
                                                        {missingUrls.map((url) => (
                                                            <div key={url} className="url-break">{url}</div>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </div>
                                        ) : (
                                            <span>{rule.details}</span>
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
