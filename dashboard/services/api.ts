import axios from "axios";
import type { EventRecord, PageRecord, RuleResultRecord, RunRecord } from "@/lib/types";

const api = axios.create({
    baseURL: "http://localhost:4000",
    timeout: 15000
});

/**
 * Build query params for optional domain and environment.
 *
 * @param site Domain/site key.
 * @param environment Environment key.
 * @returns {Record<string, string>|undefined}
 */
function buildFilters(site?: string, environment?: string): Record<string, string> | undefined {
    const params: Record<string, string> = {};

    if (site && site !== "all") {
        params.site = site;
    }

    if (environment) {
        params.environment = environment;
    }

    return Object.keys(params).length > 0 ? params : undefined;
}

/**
 * Fetch all runs.
 *
 * @param site Optional site filter.
 * @param environment Optional environment filter.
 * @returns {Promise<RunRecord[]>}
 */
export async function getRuns(site?: string, environment?: string): Promise<RunRecord[]> {
    const response = await api.get<RunRecord[]>("/api/runs", { params: buildFilters(site, environment) });
    return response.data;
}

/**
 * Fetch run by id.
 *
 * @param id Run id.
 * @param site Optional site filter.
 * @param environment Optional environment filter.
 * @returns {Promise<RunRecord>}
 */
export async function getRun(id: string, site?: string, environment?: string): Promise<RunRecord> {
    const response = await api.get<RunRecord>(`/api/runs/${id}`, { params: buildFilters(site, environment) });
    return response.data;
}

/**
 * Fetch pages for run.
 *
 * @param id Run id.
 * @param site Optional site filter.
 * @param environment Optional environment filter.
 * @returns {Promise<PageRecord[]>}
 */
export async function getPages(id: string, site?: string, environment?: string): Promise<PageRecord[]> {
    const response = await api.get<PageRecord[]>(`/api/runs/${id}/pages`, { params: buildFilters(site, environment) });
    return response.data;
}

/**
 * Fetch events for run.
 *
 * @param id Run id.
 * @param site Optional site filter.
 * @param environment Optional environment filter.
 * @returns {Promise<EventRecord[]>}
 */
export async function getEvents(id: string, site?: string, environment?: string): Promise<EventRecord[]> {
    const response = await api.get<EventRecord[]>(`/api/runs/${id}/events`, { params: buildFilters(site, environment) });
    return response.data;
}

/**
 * Fetch rule results for run.
 *
 * @param id Run id.
 * @param site Optional site filter.
 * @param environment Optional environment filter.
 * @returns {Promise<RuleResultRecord[]>}
 */
export async function getRules(id: string, site?: string, environment?: string): Promise<RuleResultRecord[]> {
    const response = await api.get<RuleResultRecord[]>(`/api/runs/${id}/rules`, { params: buildFilters(site, environment) });
    return response.data;
}

/**
 * Trigger a validator build for selected site/environment.
 *
 * @param domain Site/domain key.
 * @param environment Environment key.
 * @returns {Promise<{status: string}>}
 */
export async function triggerBuild(domain: string, environment: string): Promise<{ status: string }> {
    const response = await api.post<{ status: string }>("/api/build", {
        domain,
        environment
    });
    return response.data;
}

/**
 * Fetch run logs with status.
 *
 * @param id Run id.
 * @param site Optional site filter.
 * @param environment Optional environment filter.
 * @param limit Optional log line limit.
 * @returns {Promise<{logs: Array<{timestamp: string, message: string, isError?: boolean, source?: string}>, status: string}>}
 */
export async function getRunLogs(
    id: string,
    site?: string,
    environment?: string,
    limit = 500
): Promise<{ logs: Array<{ timestamp: string; message: string; isError?: boolean; source?: string }>; status: string }> {
    const params = {
        ...(buildFilters(site, environment) || {}),
        limit: String(limit)
    };
    const response = await api.get<{ logs: Array<{ timestamp: string; message: string; isError?: boolean; source?: string }>; status: string }>(
        `/api/runs/${id}/logs`,
        { params }
    );
    return response.data;
}
