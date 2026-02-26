export const sites = {
    indianexpress: {
        environments: {
            prod: { startUrl: "https://indianexpress.com" },
            develop: { startUrl: "https://indian-express-develop.go-vip.net" },
            preprod: { startUrl: "https://preprod.indianexpress.com" },
            prelaunch: { startUrl: "https://prelaunch.indianexpress.com" }
        },
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
        environments: {
            prod: { startUrl: "https://financialexpress.com" },
            develop: { startUrl: "https://indian-express-new-develop.go-vip.net" },
            preprod: { startUrl: "https://preprod.financialexpress.com" },
            prelaunch: { startUrl: "https://prelaunch.financialexpress.com" }
        },
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
        environments: {
            prod: { startUrl: "https://loksatta.com" },
            develop: { startUrl: "https://indianexpress-loksatta-develop.go-vip.net" },
            preprod: { startUrl: "https://preprod.loksatta.com" },
            prelaunch: { startUrl: "https://prelaunch.indianexpress.com" }
        },
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
        environments: {
            prod: { startUrl: "https://jansatta.com" },
            develop: { startUrl: "https://uat.jansatta.com" },
            preprod: { startUrl: "https://jansatta.com" },
            prelaunch: { startUrl: "https://jansatta.com" }
        },
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
