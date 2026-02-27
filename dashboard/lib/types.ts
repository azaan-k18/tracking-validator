export type RunStatus = "completed" | "failed" | "running" | "stopped" | string;

export interface RunRecord {
    _id: string;
    site?: string;
    environment?: string;
    startedAt: string;
    finishedAt: string | null;
    startUrl: string;
    pagesCrawled: number;
    eventsCaptured: number;
    rulesPassed: number;
    rulesFailed: number;
    status: RunStatus;
}

export interface PageRecord {
    _id?: string;
    runId: string;
    site?: string;
    environment?: string;
    url: string;
    depth: number;
    eventCount: number;
    providerCounts: Record<string, number>;
}

export interface EventRecord {
    _id?: string;
    runId: string;
    site?: string;
    environment?: string;
    pageUrl: string;
    providerKey: string;
    timestamp: string;
    accountId: string | null;
    requestType: string | null;
    params: Array<{
        key: string;
        field: string;
        value: string;
        group: string;
    }>;
}

export interface RuleResultRecord {
    _id?: string;
    runId: string;
    site?: string;
    environment?: string;
    ruleId: string;
    provider: string | null;
    passed: boolean;
    details: string;
}
