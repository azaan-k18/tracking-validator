import { sites } from "./sites.js";

const baseConfig = {
    runtime: {
        headless: true,
        settleMs: 1200,
        retryOnMissingProvider: true,
        retryDelayMs: 2000,
        retryCount: 1
    },
    persistence: {
        type: "mongo",
        uri: "mongodb://127.0.0.1:27017",
        dbName: "trackingValidator",
        batchSize: 50
    },
    crawl: {
        maxDepth: 1,
        maxUrls: 50,
        sameOriginOnly: true,
        include: [],
        exclude: ["\\.pdf$", "\\.xml$", "#"]
    },
    output: {
        directory: "results"
    }
};

const baseRules = [
    {
        id: "COMSCORE_EXISTS_PER_PAGE",
        description: "Comscore request should fire at least once per crawled page",
        provider: "COMSCORE",
        assert: {
            type: "existsPerPage",
            minCount: 1
        }
    }
];

/**
 * Create strict account allow-list rules from expected account map.
 *
 * @param {Record<string, string[]>} expectedAccounts Provider account expectations.
 * @returns {Array<Object>}
 */
function buildAccountAllowListRules(expectedAccounts) {
    return Object.entries(expectedAccounts || {}).map(([provider, expected]) => {
        return {
            id: `${provider}_ACCOUNT_ALLOW_LIST`,
            description: `${provider} accounts must match configured allow list`,
            provider,
            assert: {
                type: "accountAllowList",
                expected: Array.isArray(expected) ? expected : []
            }
        };
    });
}

/**
 * Build runtime config for a site key.
 *
 * @param {string} siteKey Site key from registry.
 * @returns {Object}
 */
export function buildConfigForSite(siteKey) {
    const site = sites[siteKey];
    if (!site) {
        throw new Error(`Unknown site key: ${siteKey}`);
    }

    const siteIncludes = Array.isArray(site?.crawl?.include) ? site.crawl.include : [];
    const dynamicRules = buildAccountAllowListRules(site.expectedAccounts);
    const providers = Array.from(new Set([
        "COMSCORE",
        ...Object.keys(site.expectedAccounts || {})
    ]));

    return {
        ...baseConfig,
        site: siteKey,
        startUrl: site.startUrl,
        providers,
        crawl: {
            ...baseConfig.crawl,
            ...(site.crawl || {}),
            include: siteIncludes
        },
        rules: [...baseRules, ...dynamicRules]
    };
}

export { sites };
