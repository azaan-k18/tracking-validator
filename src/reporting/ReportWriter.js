import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Writes JSON and text reports.
 *
 * @class
 */
export class ReportWriter {
    /**
     * Write report output to disk.
     *
     * @param {string} outputDir Directory.
     * @param {Object} payload Report payload.
     * @returns {Promise<{jsonPath: string, textPath: string}>}
     */
    async write(outputDir, payload) {
        await mkdir(outputDir, { recursive: true });

        const timestamp = new Date().toISOString().replaceAll(":", "-");
        const jsonPath = path.join(outputDir, `tracking-report-${timestamp}.json`);
        const textPath = path.join(outputDir, `tracking-summary-${timestamp}.txt`);

        await writeFile(jsonPath, JSON.stringify(payload, null, 4), "utf8");

        const passed = payload.results.filter((entry) => entry.passed).length;
        const failed = payload.results.length - passed;
        const summary = [
            `Run started: ${payload.meta.startedAt}`,
            `Run ended: ${payload.meta.finishedAt}`,
            `Pages crawled: ${payload.meta.pagesCrawled}`,
            `Requests captured: ${payload.meta.eventsCaptured}`,
            `Rules passed: ${passed}`,
            `Rules failed: ${failed}`,
            "",
            ...payload.results.map((entry) => `${entry.passed ? "PASS" : "FAIL"} | ${entry.id} | ${entry.details}`)
        ].join("\n");

        await writeFile(textPath, summary, "utf8");
        return { jsonPath, textPath };
    }
}
