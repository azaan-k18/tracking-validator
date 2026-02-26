#!/usr/bin/env node
import "dotenv/config";
import { runTrackingAudit } from "../src/runner/runTrackingAudit.js";
import { ALLOWED_ENVIRONMENTS, buildConfigForSiteAndEnvironment, sites } from "../config/base.config.js";

/**
 * Parse CLI arguments.
 *
 * @returns {{site?: string, all: boolean, environment: string, runId?: string}}
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const siteIndex = args.findIndex((arg) => arg === "--site");
    const envIndex = args.findIndex((arg) => arg === "--env");
    const runIdIndex = args.findIndex((arg) => arg === "--run-id");
    const all = args.includes("--all");
    const environment = envIndex >= 0 ? args[envIndex + 1] : "prod";

    return {
        site: siteIndex >= 0 ? args[siteIndex + 1] : undefined,
        all,
        environment,
        runId: runIdIndex >= 0 ? args[runIdIndex + 1] : undefined
    };
}

/**
 * Run validation for one site.
 *
 * @param {string} siteKey Site key.
 * @param {string} environment Environment key.
 * @param {string|undefined} runId Existing run id for externally managed builds.
 * @returns {Promise<{failedRules: number, error: Error|null}>}
 */
async function runForSite(siteKey, environment, runId) {
    try {
        const config = buildConfigForSiteAndEnvironment(siteKey, environment);
        if (runId) {
            config.runId = runId;
        }
        const result = await runTrackingAudit(config);
        const failedRules = result.payload.results.filter((entry) => !entry.passed).length;

        console.log(`[${siteKey}/${environment}] Run ID: ${result.payload.meta.runId}`);
        console.log(`[${siteKey}/${environment}] Pages crawled: ${result.payload.meta.pagesCrawled}`);
        console.log(`[${siteKey}/${environment}] Events captured: ${result.payload.meta.eventsCaptured}`);
        console.log(`[${siteKey}/${environment}] Rules failed: ${failedRules}`);

        if (result.output?.jsonPath) {
            console.log(`[${siteKey}/${environment}] Report JSON: ${result.output.jsonPath}`);
        }

        if (result.output?.textPath) {
            console.log(`[${siteKey}/${environment}] Report text: ${result.output.textPath}`);
        }

        return { failedRules, error: null };
    } catch (error) {
        console.error(`[${siteKey}/${environment}] Validation failed`, error);
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
    const { site, all, environment, runId } = parseArgs();

    if (!site && !all) {
        throw new Error("Provide --site <siteKey> or --all");
    }

    if (site && all) {
        throw new Error("Use either --site or --all, not both");
    }

    if (all && runId) {
        throw new Error("--run-id can only be used with --site");
    }

    if (!ALLOWED_ENVIRONMENTS.includes(environment)) {
        throw new Error(`Invalid environment: ${environment}. Allowed: ${ALLOWED_ENVIRONMENTS.join(", ")}`);
    }

    if (site) {
        if (!sites[site]) {
            throw new Error(`Unknown site key: ${site}`);
        }

        const result = await runForSite(site, environment, runId);
        if (result.error || result.failedRules > 0) {
            process.exitCode = 1;
        }
        return;
    }

    let hasFailures = false;
    const siteKeys = Object.keys(sites);

    for (const siteKey of siteKeys) {
        const result = await runForSite(siteKey, environment);
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
