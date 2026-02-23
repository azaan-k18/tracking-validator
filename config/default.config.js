/**
 * Default tracking validator config.
 */
export default {
    startUrl: "https://indianexpress.com",
    providers: ["COMSCORE"],
    crawl: {
        maxDepth: 1,
        maxUrls: 5,
        sameOriginOnly: true,
        include: [
            "/article/",
            "/section/"
        ],
        exclude: ["\\.pdf$", "\\.xml$", "#"]
    },
    runtime: {
        headless: true,
        settleMs: 1200
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
        }
    ],
    output: {
        directory: "results"
    }
};
