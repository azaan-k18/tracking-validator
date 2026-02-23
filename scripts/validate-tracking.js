#!/usr/bin/env node
import path from "node:path";
import { pathToFileURL } from "node:url";
import { runTrackingAudit } from "../src/runner/runTrackingAudit.js";

/**
 * Resolve CLI config path.
 *
 * @returns {string}
 */
function getConfigPath() {
    const index = process.argv.findIndex((arg) => arg === "--config");
    if (index >= 0 && process.argv[index + 1]) {
        return path.resolve(process.cwd(), process.argv[index + 1]);
    }

    return path.resolve(process.cwd(), "config/default.config.js");
}

/**
 * Execute CLI workflow.
 *
 * @returns {Promise<void>}
 */
async function main() {
    const configPath = getConfigPath();
    const configModule = await import(pathToFileURL(configPath).href);
    const config = configModule.default;

    if (!config?.startUrl) {
        throw new Error("config.startUrl is required");
    }

    const result = await runTrackingAudit(config);
    const failed = result.payload.results.filter((entry) => !entry.passed);

    console.log(`Report JSON: ${result.output.jsonPath}`);
    console.log(`Report text: ${result.output.textPath}`);
    console.log(`Pages crawled: ${result.payload.meta.pagesCrawled}`);
    console.log(`Events captured: ${result.payload.meta.eventsCaptured}`);
    console.log(`Rules failed: ${failed.length}`);

    if (failed.length > 0) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
