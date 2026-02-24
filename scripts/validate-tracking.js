#!/usr/bin/env node
import "dotenv/config";
import { runTrackingAudit } from "../src/runner/runTrackingAudit.js";
import { buildConfigForSite, sites } from "../config/base.config.js";

/**
 * Parse CLI arguments.
 *
 * @returns {{site?: string, all: boolean}}
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const siteIndex = args.findIndex((arg) => arg === "--site");
    const all = args.includes("--all");

    return {
        site: siteIndex >= 0 ? args[siteIndex + 1] : undefined,
        all
    };
}

/**
 * Run validation for one site.
 *
 * @param {string} siteKey Site key.
 * @returns {Promise<{failedRules: number, error: Error|null}>}
 */
async function runForSite(siteKey) {
    try {
        const config = buildConfigForSite(siteKey);
        const result = await runTrackingAudit(config);
        const failedRules = result.payload.results.filter((entry) => !entry.passed).length;

        console.log(`[${siteKey}] Run ID: ${result.payload.meta.runId}`);
        console.log(`[${siteKey}] Pages crawled: ${result.payload.meta.pagesCrawled}`);
        console.log(`[${siteKey}] Events captured: ${result.payload.meta.eventsCaptured}`);
        console.log(`[${siteKey}] Rules failed: ${failedRules}`);

        if (result.output?.jsonPath) {
            console.log(`[${siteKey}] Report JSON: ${result.output.jsonPath}`);
        }

        if (result.output?.textPath) {
            console.log(`[${siteKey}] Report text: ${result.output.textPath}`);
        }

        return { failedRules, error: null };
    } catch (error) {
        console.error(`[${siteKey}] Validation failed`, error);
        return {
            failedRules: 0,
            error: error instanceof Error ? error : new Error("Unknown error")
        };
    }
}

/**
 * Execute CLI workflow.
 *
 * @returns {Promise<void>}
 */
async function main() {
    const { site, all } = parseArgs();

    if (!site && !all) {
        throw new Error("Provide --site <siteKey> or --all");
    }

    if (site && all) {
        throw new Error("Use either --site or --all, not both");
    }

    if (site) {
        if (!sites[site]) {
            throw new Error(`Unknown site key: ${site}`);
        }

        const result = await runForSite(site);
        if (result.error || result.failedRules > 0) {
            process.exitCode = 1;
        }
        return;
    }

    let hasFailures = false;
    const siteKeys = Object.keys(sites);

    for (const siteKey of siteKeys) {
        const result = await runForSite(siteKey);
        if (result.error || result.failedRules > 0) {
            hasFailures = true;
        }
    }

    if (hasFailures) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
