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
        const filtered = events.filter((event) => event.parsed.provider.key === providerKey);
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
            const missing = pages
                .filter((page) => this.pageMatches(rule, page.url))
                .filter((page) => scoped.filter((event) => event.pageUrl === page.url).length < minCount)
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
            const match = scoped.some((event) => event.parsed.data.some((entry) => entry.key === paramKey && entry.value === expected));
            return {
                id: rule.id,
                description: rule.description,
                passed: match,
                details: match ? `Found ${paramKey}=${expected}` : `Did not find ${paramKey}=${expected}`
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
     * Filter events by rule scope.
     *
     * @param {Object} rule Rule.
     * @param {Array<Object>} events Provider events.
     * @param {Array<{url: string, depth: number}>} pages Crawled pages.
     * @returns {Array<Object>}
     */
    scopeEvents(rule, events, pages) {
        const pageSet = new Set(pages.filter((page) => this.pageMatches(rule, page.url)).map((page) => page.url));
        return events.filter((event) => pageSet.has(event.pageUrl));
    }

    /**
     * Check if page URL matches optional rule scope.
     *
     * @param {Object} rule Rule.
     * @param {string} url URL to test.
     * @returns {boolean}
     */
    pageMatches(rule, url) {
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
