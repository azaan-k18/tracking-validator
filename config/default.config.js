/**
 * Default tracking validator config.
 */
export default {
    startUrl: "https://indianexpress.com",
    providers: [
        "COMSCORE",
        "FACEBOOKPIXEL",
        "GOOGLEADS",
        "UNIVERSALANALYTICS",
        "GOOGLEANALYTICS4",
        "GOOGLETAGMANAGER"],
    crawl: {
        maxDepth: 1,
        maxUrls: 50,
        sameOriginOnly: true,
        include: [
            "/article/",
            "/section/"
        ],
        exclude: ["\\.pdf$", "\\.xml$", "#"]
    },
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
    rules: [
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
            id: "COMSCORE_ACCOUNT_ID",
            description: "Comscore account c2 must equal expected account ID",
            provider: "COMSCORE",
            assert: {
                type: "paramEquals",
                paramKey: "c2",
                expected: "8738137"
            }
        },
        {
            id: "GOOGLEADS_STRICT_ACCOUNTS",
            description: "Both expected Google Ads accounts must fire and no others",
            provider: "GOOGLEADS",
            assert: {
                type: "accountAllowList",
                expected: [
                    "AW-11033859954",
                    "AW-356047812"
                ]
            }
        },
        {
            id: "FACEBOOK_PIXEL_STRICT",
            description: "Facebook Pixel must match expected ID and no others",
            provider: "FACEBOOKPIXEL",
            assert: {
                type: "accountAllowList",
                expected: ["444470064056909"]
            }
        },
        {
            id: "GA4_STRICT",
            description: "GA4 Measurement ID must match expected and no others",
            provider: "GOOGLEANALYTICS4",
            assert: {
                type: "accountAllowList",
                expected: ["G-HEQWL2KPC5"]
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
        },
        {
            id: "GTM_STRICT",
            description: "GTM container must match expected and no others",
            provider: "GOOGLETAGMANAGER",
            assert: {
                type: "accountAllowList",
                expected: ["GTM-PGQG2HFB"]
            }
        },

    ],
    output: {
        directory: "results"
    }
};
