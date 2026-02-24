export const sites = {
    indianexpress: {
        startUrl: "https://indianexpress.com",
        crawl: {
            maxDepth: 1,
            maxUrls: 50,
            sameOriginOnly: true,
            include: ["/article/", "/section/"]
        },
        expectedAccounts: {
            GOOGLEADS: ["AW-11033859954", "AW-356047812"],
            // FACEBOOKPIXEL: ["444470064056909"],
            GOOGLEANALYTICS4: ["G-HEQWL2KPC5"],
            GOOGLETAGMANAGER: ["GTM-PGQG2HFB"]
        }
    },
    financialexpress: {
        startUrl: "https://financialexpress.com",
        crawl: {
            maxDepth: 1,
            maxUrls: 50,
            sameOriginOnly: true,
            include: ["/market/", "business/industry/", "/money/"]
        },
        expectedAccounts: {
            GOOGLEANALYTICS4: ["G-VH7JQY923R"],
            GOOGLETAGMANAGER: ["GTM-NSFSLL9K"]
        }
    },
    loksatta: {
        startUrl: "https://loksatta.com",
        crawl: {
            maxDepth: 1,
            maxUrls: 50,
            sameOriginOnly: true,
            include: [
                "/maharashtra/", "/cities/", "/politics/",
                "/krida/", "/explained/", "/trending/"]
        },
        expectedAccounts: {
            GOOGLEADS: ["AW-16764019821"],
            // FACEBOOKPIXEL: ["570412369267128"],
            GOOGLEANALYTICS4: ["G-6TSB6QLBJJ"]
        }
    },
    jansatta: {
        startUrl: "https://jansatta.com",
        crawl: {
            maxDepth: 1,
            maxUrls: 50,
            sameOriginOnly: true,
            include: ["/national/", "/entertainment/", "/khel/"]
        },
        expectedAccounts: {
            GOOGLEANALYTICS4: ["G-0G0LFX92ZL"]
        }
    }
};
