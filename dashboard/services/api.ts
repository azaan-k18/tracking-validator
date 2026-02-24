import axios from "axios";
import type { EventRecord, PageRecord, RuleResultRecord, RunRecord } from "@/lib/types";

const api = axios.create({
    baseURL: "http://localhost:4000",
    timeout: 15000
});

/**
 * Fetch all runs.
 *
 * @param site Optional site filter.
 * @returns {Promise<RunRecord[]>}
 */
export async function getRuns(site?: string): Promise<RunRecord[]> {
    const params = site && site !== "all" ? { site } : undefined;
    const response = await api.get<RunRecord[]>("/api/runs", { params });
    return response.data;
}

/**
 * Fetch run by id.
 *
 * @param id Run id.
 * @returns {Promise<RunRecord>}
 */
export async function getRun(id: string): Promise<RunRecord> {
    const response = await api.get<RunRecord>(`/api/runs/${id}`);
    return response.data;
}

/**
 * Fetch pages for run.
 *
 * @param id Run id.
 * @returns {Promise<PageRecord[]>}
 */
export async function getPages(id: string): Promise<PageRecord[]> {
    const response = await api.get<PageRecord[]>(`/api/runs/${id}/pages`);
    return response.data;
}

/**
 * Fetch events for run.
 *
 * @param id Run id.
 * @returns {Promise<EventRecord[]>}
 */
export async function getEvents(id: string): Promise<EventRecord[]> {
    const response = await api.get<EventRecord[]>(`/api/runs/${id}/events`);
    return response.data;
}

/**
 * Fetch rule results for run.
 *
 * @param id Run id.
 * @returns {Promise<RuleResultRecord[]>}
 */
export async function getRules(id: string): Promise<RuleResultRecord[]> {
    const response = await api.get<RuleResultRecord[]>(`/api/runs/${id}/rules`);
    return response.data;
}
