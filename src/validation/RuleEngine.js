/**
 * In-run rule engine for tracking assertions.
 *
 * @class
 */
export class RuleEngine {
    /**
     * Create rule engine.
     *
     * @param {Array<Object>} rules Validation rules.
     */
    constructor(rules = []) {
        this.rules = rules;
    }

    /**
     * Evaluate all rules against events and crawled pages.
     *
     * @param {Array<Object>} events Captured events.
     * @param {Array<{url: string, depth: number}>} pages Crawled pages.
     * @returns {Array<Object>}
     */
    evaluate(events, pages) {
        return this.rules.map((rule) => this.evaluateRule(rule, events, pages));
    }

    /**
     * Evaluate one rule.
     *
     * @param {Object} rule Rule config.
     * @param {Array<Object>} events Captured events.
     * @param {Array<{url: string, depth: number}>} pages Crawled pages.
     * @returns {Object}
     */
    evaluateRule(rule, events, pages) {
        const providerKey = String(rule.provider || "").toUpperCase();
        const filtered = (Array.isArray(events) ? events : []).filter((event) => {
            return String(event?.parsed?.provider?.key || "").toUpperCase() === providerKey;
        });
        const scoped = this.scopeEvents(rule, filtered, pages);
        const assertType = rule.assert?.type || "exists";

        if (assertType === "exists") {
            const minCount = rule.assert?.minCount ?? 1;
            const passed = scoped.length >= minCount;
            return {
                id: rule.id,
                description: rule.description,
                passed,
                details: `Expected at least ${minCount}, got ${scoped.length}`
            };
        }

        if (assertType === "existsPerPage") {
            const minCount = rule.assert?.minCount ?? 1;
            const scopedPages = Array.isArray(pages) ? pages : [];
            const missing = scopedPages
                .filter((page) => this.pageMatches(rule, page.url))
                .filter((page) => scoped.filter((event) => event?.pageUrl === page.url).length < minCount)
                .map((page) => page.url);

            return {
                id: rule.id,
                description: rule.description,
                passed: missing.length === 0,
                details: missing.length === 0 ? "All pages satisfy rule" : `Missing on: ${missing.join(", ")}`
            };
        }

        if (assertType === "paramEquals") {
            const paramKey = rule.assert?.paramKey;
            const expected = rule.assert?.expected;
            const match = scoped.some((event) => this.getParamValue(event, paramKey) === expected);
            return {
                id: rule.id,
                description: rule.description,
                passed: match,
                details: match ? `Found ${paramKey}=${expected}` : `Did not find ${paramKey}=${expected}`
            };
        }

        if (assertType === "accountAllowList") {
            if (scoped.length === 0) {
                return {
                    id: rule.id,
                    description: rule.description,
                    passed: false,
                    details: "Provider did not fire."
                };
            }

            const accountKey = this.getAccountColumnKey(scoped);
            if (!accountKey) {
                return {
                    id: rule.id,
                    description: rule.description,
                    passed: false,
                    details: "Provider has no account column mapping."
                };
            }

            const expectedRaw = rule.assert?.expected;
            const expectedValues = Array.isArray(expectedRaw)
                ? expectedRaw
                    .map((value) => String(value || "").trim())
                    .filter((value) => value.length > 0)
                : [];
            const expectedSet = new Set(expectedValues);

            const seenSet = new Set();
            scoped.forEach((event) => {
                const value = this.getParamValue(event, accountKey);
                if (typeof value === "string" && value.trim().length > 0) {
                    seenSet.add(value.trim());
                }
            });

            const missing = Array.from(expectedSet).filter((value) => !seenSet.has(value));
            const unexpected = Array.from(seenSet).filter((value) => !expectedSet.has(value));
            const passed = missing.length === 0 && unexpected.length === 0;

            return {
                id: rule.id,
                description: rule.description,
                passed,
                details: passed
                    ? "All expected accounts fired and no unexpected accounts detected."
                    : `Missing: ${missing.length > 0 ? missing.join(", ") : "none"} | Unexpected: ${unexpected.length > 0 ? unexpected.join(", ") : "none"}`
            };
        }

        return {
            id: rule.id,
            description: rule.description,
            passed: false,
            details: `Unknown assert type: ${assertType}`
        };
    }

    /**
     * Get parameter value from event data safely.
     *
     * @param {Object} event Event object.
     * @param {string} key Parameter key.
     * @returns {string|undefined}
     */
    getParamValue(event, key) {
        if (!key || !event || !Array.isArray(event?.parsed?.data)) {
            return undefined;
        }

        const match = event.parsed.data.find((entry) => {
            return entry && typeof entry === "object" && entry.key === key;
        });

        if (!match) {
            return undefined;
        }

        return typeof match.value === "string" ? match.value : String(match.value);
    }

    /**
     * Extract account column key from scoped events.
     *
     * @param {Array<Object>} providerEvents Provider events in scope.
     * @returns {string|undefined}
     */
    getAccountColumnKey(providerEvents) {
        for (const event of providerEvents) {
            const accountKey = event?.parsed?.provider?.columns?.account;
            if (typeof accountKey === "string" && accountKey.trim().length > 0) {
                return accountKey;
            }
        }

        return undefined;
    }

    /**
     * Filter events by rule scope.
     *
     * @param {Object} rule Rule.
     * @param {Array<Object>} events Provider events.
     * @param {Array<{url: string, depth: number}>} pages Crawled pages.
     * @returns {Array<Object>}
     */
    scopeEvents(rule, events, pages) {
        const safePages = Array.isArray(pages) ? pages : [];
        const pageSet = new Set(safePages.filter((page) => this.pageMatches(rule, page.url)).map((page) => page.url));
        return (Array.isArray(events) ? events : []).filter((event) => pageSet.has(event?.pageUrl));
    }

    /**
     * Check if page URL matches optional rule scope.
     *
     * @param {Object} rule Rule.
     * @param {string} url URL to test.
     * @returns {boolean}
     */
    pageMatches(rule, url) {
        if (typeof url !== "string") {
            return false;
        }

        const pathIncludes = rule.where?.pathIncludes;
        const pathExcludes = rule.where?.pathExcludes;

        if (pathIncludes && !new RegExp(pathIncludes).test(url)) {
            return false;
        }

        if (pathExcludes && new RegExp(pathExcludes).test(url)) {
            return false;
        }

        return true;
    }
}
