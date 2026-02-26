import { chromium } from "playwright";
import { SiteCrawler } from "../crawler/SiteCrawler.js";
import { ProviderRegistry } from "../core/ProviderRegistry.js";
import { RequestCollector } from "../core/RequestCollector.js";
import { buildProviders } from "../providers/index.js";
import { RuleEngine } from "../validation/RuleEngine.js";
import { createReportRepository } from "../persistence/createReportRepository.js";
import { EmailAlertService } from "../alerts/EmailAlertService.js";

/**
 * Extract a parameter value from parsed provider data.
 *
 * @param {Array<Object>} params Parsed parameter list.
 * @param {string} key Parameter key.
 * @returns {string|null}
 */
function getParamValue(params, key) {
    const entry = params.find((item) => item.key === key);
    return entry ? entry.value : null;
}

/**
 * Normalize captured event for persistence.
 *
 * @param {Object} event Captured request event.
 * @returns {Object}
 */
function normalizeEvent(event) {
    const accountKey = event.parsed.provider.columns?.account;
    const requestTypeKey = event.parsed.provider.columns?.requestType;

    return {
        pageUrl: event.pageUrl,
        providerKey: event.parsed.provider.key,
        timestamp: event.timestamp,
        accountId: accountKey ? getParamValue(event.parsed.data, accountKey) : null,
        requestType: requestTypeKey ? getParamValue(event.parsed.data, requestTypeKey) : null,
        params: event.parsed.data
    };
}

/**
 * Build provider event counts for a page.
 *
 * @param {Array<Object>} pageEvents Events for a specific page.
 * @returns {Object}
 */
function buildProviderCounts(pageEvents) {
    return pageEvents.reduce((accumulator, event) => {
        const key = event.parsed.provider.key;
        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
    }, {});
}

/**
 * Get provider keys that must exist per page.
 *
 * @param {Array<Object>} rules Configured rules.
 * @returns {Set<string>}
 */
function getPerPageRequiredProviders(rules) {
    const requirements = [];
    (rules || []).forEach((rule) => {
        const provider = String(rule?.provider || "").toUpperCase();
        if (!provider) {
            return;
        }

        if (rule?.assert?.type === "existsPerPage") {
            requirements.push({
                id: rule.id || `${provider}_EXISTS_PER_PAGE`,
                provider,
                where: rule.where
            });
        }

        if (rule?.assert?.type === "exactlyOnePerPage" && rule?.assert?.paramKey && typeof rule?.assert?.expected !== "undefined") {
            requirements.push({
                id: rule.id || `${provider}_PARAM_REQUIRED`,
                provider,
                where: rule.where,
                paramKey: rule.assert.paramKey,
                expected: rule.assert.expected
            });
        }
    });
    return requirements;
}

/**
 * Determine whether page URL is in rule scope.
 *
 * @param {Object} ruleRequirement Requirement entry.
 * @param {string} url Page URL.
 * @returns {boolean}
 */
function pageMatchesRequirement(ruleRequirement, url) {
    if (typeof url !== "string") {
        return false;
    }

    const pathIncludes = ruleRequirement?.where?.pathIncludes;
    const pathExcludes = ruleRequirement?.where?.pathExcludes;

    if (pathIncludes && !new RegExp(pathIncludes).test(url)) {
        return false;
    }

    if (pathExcludes && new RegExp(pathExcludes).test(url)) {
        return false;
    }

    return true;
}

/**
 * Get missing required rule checks for a page.
 *
 * @param {Array<Object>} events All collected events.
 * @param {string} pageUrl Page URL.
 * @param {Array<Object>} requiredChecks Required checks.
 * @returns {Array<string>}
 */
function getMissingChecksForPage(events, pageUrl, requiredChecks) {
    if (!Array.isArray(requiredChecks) || requiredChecks.length === 0) {
        return [];
    }

    const pageEvents = events.filter((event) => event.pageUrl === pageUrl);
    return requiredChecks
        .filter((requirement) => pageMatchesRequirement(requirement, pageUrl))
        .filter((requirement) => {
            const providerEvents = pageEvents.filter((event) => {
                return String(event?.parsed?.provider?.key || "").toUpperCase() === requirement.provider;
            });

            if (!requirement.paramKey) {
                return providerEvents.length === 0;
            }

            return !providerEvents.some((event) => {
                const param = (event?.parsed?.data || []).find((entry) => entry?.key === requirement.paramKey);
                const value = param?.value;
                return String(value || "") === String(requirement.expected);
            });
        })
        .map((requirement) => String(requirement.id || requirement.provider));
}

/**
 * Run tracking audit end-to-end.
 *
 * @param {Object} config Runtime configuration.
 * @returns {Promise<Object>}
 */
export async function runTrackingAudit(config) {
    const site = config.site || "unknown";
    const environment = config.environment || "prod";
    const externalRunId = typeof config.runId === "string" ? config.runId : "";
    const startedAt = new Date().toISOString();
    const repository = await createReportRepository(config.persistence, config.output);

    const browser = await chromium.launch({
        headless: config.runtime?.headless ?? true
    });

    const context = await browser.newContext({
        userAgent: config.runtime?.userAgent || undefined
    });

    const crawler = new SiteCrawler(config.crawl || {});
    const providerRegistry = new ProviderRegistry(buildProviders(config.providers || []));
    const ruleEngine = new RuleEngine(config.rules || []);
    const requiredPerPageChecks = getPerPageRequiredProviders(config.rules || []);
    const trackingWindowMs = config.runtime?.trackingWindowMs ?? 7000;
    const retryOnMissingProvider = config.runtime?.retryOnMissingProvider ?? true;
    const retryDelayMs = config.runtime?.retryDelayMs ?? 2000;
    const retryCount = config.runtime?.retryCount ?? 1;
    const debug = String(process.env.DEBUG || "").toLowerCase() === "true";

    const allEvents = [];
    const pendingWrites = new Set();

    const queueWrite = (promise) => {
        const tracked = promise
            .catch((error) => {
                throw error;
            })
            .finally(() => {
                pendingWrites.delete(tracked);
            });
        pendingWrites.add(tracked);
    };

    const collector = new RequestCollector(providerRegistry, {
        retainEvents: false,
        debug,
        onEvent: (event) => {
            allEvents.push(event);
            const normalizedEvent = {
                site,
                environment,
                ...normalizeEvent(event)
            };
            queueWrite(repository.saveEvents([normalizedEvent], runId));
        }
    });

    let runId = "";

    try {
        runId = await repository.saveRun({
            runId: externalRunId || undefined,
            site,
            environment,
            startedAt,
            finishedAt: null,
            startUrl: config.startUrl,
            pagesCrawled: 0,
            eventsCaptured: 0,
            rulesPassed: 0,
            rulesFailed: 0,
            status: "running"
        });

        const urls = await crawler.crawl(config.startUrl, async () => context.newPage());

        for (const target of urls) {
            const page = await context.newPage();
            collector.attach(page, target.url);

            try {
                await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 30000 });
                await page.waitForTimeout(config.runtime?.settleMs ?? 1000);
                await page.waitForTimeout(trackingWindowMs);

                if (retryOnMissingProvider && retryCount > 0 && requiredPerPageChecks.length > 0) {
                    let missingChecks = getMissingChecksForPage(allEvents, target.url, requiredPerPageChecks);
                    let attempt = 0;

                    while (missingChecks.length > 0 && attempt < retryCount) {
                        attempt += 1;
                        if (debug) {
                            console.log(`[Retry][${site}] ${target.url} missing checks: ${missingChecks.join(", ")}. Retrying in ${retryDelayMs}ms (attempt ${attempt}/${retryCount})`);
                        }

                        await page.waitForTimeout(retryDelayMs);
                        missingChecks = getMissingChecksForPage(allEvents, target.url, requiredPerPageChecks);
                    }
                }
            } catch {
                // Continue if page fails.
            } finally {
                await page.close();
            }

            const pageEvents = allEvents.filter((event) => event.pageUrl === target.url);
            queueWrite(repository.savePages([
                {
                    site,
                    environment,
                    url: target.url,
                    depth: target.depth,
                    eventCount: pageEvents.length,
                    providerCounts: buildProviderCounts(pageEvents)
                }
            ], runId));
        }

        await Promise.all(Array.from(pendingWrites));

        const results = ruleEngine.evaluate(allEvents, urls);
        const failed = results.filter((entry) => !entry.passed).length;
        const passed = results.length - failed;
        const finishedAt = new Date().toISOString();

        const ruleRecords = results.map((result) => {
            const sourceRule = (config.rules || []).find((rule) => rule.id === result.id);
            return {
                site,
                environment,
                ruleId: result.id,
                provider: sourceRule?.provider || null,
                passed: result.passed,
                details: result.details
            };
        });

        await repository.saveRuleResults(ruleRecords, runId);

        if (failed > 0) {
            try {
                const failedResults = results.filter((entry) => !entry.passed);
                const failures = failedResults.map((result) => {
                    const sourceRule = (config.rules || []).find((rule) => rule.id === result.id);
                    return {
                        provider: sourceRule?.provider || "UNKNOWN",
                        details: result?.details || "Rule failed."
                    };
                });
                const website = new URL(config.startUrl).hostname;
                const emailAlertService = new EmailAlertService({
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT,
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                    from: process.env.ALERT_FROM,
                    to: process.env.ALERT_TO
                });

                await emailAlertService.sendFailureAlert({
                    site,
                    website,
                    failures
                });
            } catch (error) {
                console.error("Email alert process failed", error);
            }
        }

        await repository.saveRun({
            runId,
            site,
            environment,
            startedAt,
            finishedAt,
            startUrl: config.startUrl,
            pagesCrawled: urls.length,
            eventsCaptured: allEvents.length,
            rulesPassed: passed,
            rulesFailed: failed,
            status: "completed"
        });

        const output = await repository.close();

        return {
            payload: {
                meta: {
                    runId,
                    site,
                    environment,
                    startedAt,
                    finishedAt,
                    startUrl: config.startUrl,
                    pagesCrawled: urls.length,
                    eventsCaptured: allEvents.length,
                    rulesPassed: passed,
                    rulesFailed: failed,
                    status: "completed"
                },
                crawl: urls,
                results,
                events: allEvents
            },
            output
        };
    } catch (error) {
        if (runId) {
            const failedAt = new Date().toISOString();
            await repository.saveRun({
                runId,
                site,
                environment,
                startedAt,
                finishedAt: failedAt,
                startUrl: config.startUrl,
                pagesCrawled: 0,
                eventsCaptured: allEvents.length,
                rulesPassed: 0,
                rulesFailed: 0,
                status: "failed"
            });
        }

        await repository.close();
        throw error;
    } finally {
        await context.close();
        await browser.close();
    }
}
