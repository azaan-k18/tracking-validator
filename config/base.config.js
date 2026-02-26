import { sites } from "./sites.js";

export const ALLOWED_ENVIRONMENTS = ["prod", "develop", "preprod", "prelaunch"];

const baseConfig = {
    runtime: {
        headless: true,
        settleMs: 1200,
        trackingWindowMs: 7000,
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
    },
    {
        id: "GA4_PAGE_VIEW_PER_PAGE",
        description: "GA4 page_view should fire exactly once per crawled page",
        provider: "GOOGLEANALYTICS4",
        assert: {
            type: "exactlyOnePerPage",
            expectedCount: 1,
            paramKey: "en",
            expected: "page_view"
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
 * Keep only rules relevant for configured providers.
 *
 * @param {Array<Object>} rules Base rules.
 * @param {Set<string>} providerSet Enabled providers.
 * @returns {Array<Object>}
 */
function filterRulesByProvider(rules, providerSet) {
    return (rules || []).filter((rule) => {
        const provider = String(rule?.provider || "").toUpperCase();
        return provider.length > 0 && providerSet.has(provider);
    });
}

/**
 * Build runtime config for a site key.
 *
 * @param {string} siteKey Site key from registry.
 * @returns {Object}
 */
export function buildConfigForSite(siteKey) {
    return buildConfigForSiteAndEnvironment(siteKey, "prod");
}

/**
 * Resolve start URL for site/environment with prod fallback.
 *
 * @param {Object} site Site config.
 * @param {string} environment Environment key.
 * @returns {string}
 */
function resolveStartUrl(site, environment) {
    const resolvedEnvironment = ALLOWED_ENVIRONMENTS.includes(environment) ? environment : "prod";
    const environmentUrl = site?.environments?.[resolvedEnvironment]?.startUrl;
    const prodUrl = site?.environments?.prod?.startUrl;
    const legacyUrl = site?.startUrl;
    const startUrl = environmentUrl || prodUrl || legacyUrl;

    if (!startUrl) {
        throw new Error("No startUrl configured for site/environment.");
    }

    return startUrl;
}

/**
 * Build runtime config for a site key and environment.
 *
 * @param {string} siteKey Site key from registry.
 * @param {string} environment Environment key.
 * @returns {Object}
 */
export function buildConfigForSiteAndEnvironment(siteKey, environment = "prod") {
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
    const providerSet = new Set(providers.map((provider) => String(provider).toUpperCase()));

    return {
        ...baseConfig,
        site: siteKey,
        environment: ALLOWED_ENVIRONMENTS.includes(environment) ? environment : "prod",
        startUrl: resolveStartUrl(site, environment),
        providers,
        crawl: {
            ...baseConfig.crawl,
            ...(site.crawl || {}),
            include: siteIncludes
        },
        rules: [...filterRulesByProvider(baseRules, providerSet), ...dynamicRules]
    };
}

export { sites };
