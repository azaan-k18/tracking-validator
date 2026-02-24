import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ReportRepository } from "./ReportRepository.js";

/**
 * File-based report repository.
 *
 * @class
 * @extends ReportRepository
 */
export class FileReportRepository extends ReportRepository {
    /**
     * Create file repository.
     *
     * @param {{outputDir?: string}} options Repository options.
     */
    constructor(options = {}) {
        super();
        this.outputDir = options.outputDir || "results";
        this.runMeta = null;
        this.pages = [];
        this.events = [];
        this.results = [];
        this.runId = "";
    }

    /**
     * Save run metadata.
     *
     * @param {Object} meta Run metadata.
     * @returns {Promise<string>}
     */
    async saveRun(meta) {
        this.runId = meta.runId || `file-${Date.now()}`;
        this.runMeta = {
            ...meta,
            runId: this.runId
        };
        return this.runId;
    }

    /**
     * Save page records.
     *
     * @param {Array<Object>} pages Page records.
     * @param {string} runId Run identifier.
     * @returns {Promise<void>}
     */
    async savePages(pages, runId) {
        if (!Array.isArray(pages) || pages.length === 0) {
            return;
        }

        const records = pages.map((page) => ({
            runId,
            ...page
        }));
        this.pages.push(...records);
    }

    /**
     * Save event records.
     *
     * @param {Array<Object>} events Event records.
     * @param {string} runId Run identifier.
     * @returns {Promise<void>}
     */
    async saveEvents(events, runId) {
        if (!Array.isArray(events) || events.length === 0) {
            return;
        }

        const records = events.map((event) => ({
            runId,
            ...event
        }));
        this.events.push(...records);
    }

    /**
     * Save rule result records.
     *
     * @param {Array<Object>} results Rule results.
     * @param {string} runId Run identifier.
     * @returns {Promise<void>}
     */
    async saveRuleResults(results, runId) {
        if (!Array.isArray(results) || results.length === 0) {
            return;
        }

        const records = results.map((result) => ({
            runId,
            ...result
        }));
        this.results.push(...records);
    }

    /**
     * Flush files and close repository.
     *
     * @returns {Promise<{jsonPath: string, textPath: string}>}
     */
    async close() {
        await mkdir(this.outputDir, { recursive: true });

        const timestamp = new Date().toISOString().replaceAll(":", "-");
        const jsonPath = path.join(this.outputDir, `tracking-report-${timestamp}.json`);
        const textPath = path.join(this.outputDir, `tracking-summary-${timestamp}.txt`);

        const payload = {
            meta: this.runMeta,
            crawl: this.pages.map((page) => ({
                url: page.url,
                depth: page.depth
            })),
            results: this.results,
            events: this.events
        };

        await writeFile(jsonPath, JSON.stringify(payload, null, 4), "utf8");

        const passed = this.results.filter((entry) => entry.passed).length;
        const failed = this.results.length - passed;
        const summary = [
            `Run started: ${this.runMeta?.startedAt || ""}`,
            `Run ended: ${this.runMeta?.finishedAt || ""}`,
            `Pages crawled: ${this.runMeta?.pagesCrawled || 0}`,
            `Requests captured: ${this.runMeta?.eventsCaptured || 0}`,
            `Rules passed: ${passed}`,
            `Rules failed: ${failed}`,
            "",
            ...this.results.map((entry) => `${entry.passed ? "PASS" : "FAIL"} | ${entry.ruleId || entry.id} | ${entry.details}`)
        ].join("\n");

        await writeFile(textPath, summary, "utf8");
        return { jsonPath, textPath };
    }
}
