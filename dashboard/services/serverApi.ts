import type { EventRecord, PageRecord, RuleResultRecord, RunRecord } from "@/lib/types";

const BASE_URL = "http://localhost:4000";

/**
 * Build URL with query params.
 *
 * @param path API path.
 * @param site Site/domain key.
 * @param environment Environment key.
 * @param limit Optional limit.
 * @returns {string}
 */
function buildUrl(path: string, site?: string, environment?: string, limit?: number): string {
    const url = new URL(path, BASE_URL);

    if (site) {
        url.searchParams.set("site", site);
    }

    if (environment) {
        url.searchParams.set("environment", environment);
    }

    if (typeof limit === "number") {
        url.searchParams.set("limit", String(limit));
    }

    return url.toString();
}

/**
 * Fetch JSON from API on server.
 *
 * @param url Resource URL.
 * @returns {Promise<T>}
 */
async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

/**
 * Fetch run detail bundle.
 *
 * @param id Run id.
 * @param site Site/domain key.
 * @param environment Environment key.
 * @returns {Promise<{run: RunRecord, pages: PageRecord[], events: EventRecord[], rules: RuleResultRecord[]}>}
 */
export async function getRunBundle(id: string, site?: string, environment?: string): Promise<{
    run: RunRecord;
    pages: PageRecord[];
    events: EventRecord[];
    rules: RuleResultRecord[];
}> {
    const [run, pages, events, rules] = await Promise.all([
        fetchJson<RunRecord>(buildUrl(`/api/runs/${id}`, site, environment)),
        fetchJson<PageRecord[]>(buildUrl(`/api/runs/${id}/pages`, site, environment)),
        fetchJson<EventRecord[]>(buildUrl(`/api/runs/${id}/events`, site, environment, 1000)),
        fetchJson<RuleResultRecord[]>(buildUrl(`/api/runs/${id}/rules`, site, environment))
    ]);

    return {
        run,
        pages,
        events,
        rules
    };
}
