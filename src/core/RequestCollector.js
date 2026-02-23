/**
 * Captures matched provider requests for each visited page.
 *
 * @class
 */
export class RequestCollector {
    /**
     * Create a request collector.
     *
     * @param {import("./ProviderRegistry.js").ProviderRegistry} providerRegistry Registry.
     */
    constructor(providerRegistry) {
        this.providerRegistry = providerRegistry;
        this.events = [];
    }

    /**
     * Attach listeners to page and collect parsed events.
     *
     * @param {import("playwright").Page} page Playwright page.
     * @param {string} pageUrl Current page URL.
     */
    attach(page, pageUrl) {
        page.on("request", async (request) => {
            const requestUrl = request.url();
            let postData = "";

            if (request.method() !== "GET") {
                postData = request.postData() || "";
            }

            const parsed = this.providerRegistry.parseRequest(requestUrl, postData);
            if (!parsed) {
                return;
            }

            this.events.push({
                timestamp: new Date().toISOString(),
                pageUrl,
                request: {
                    url: requestUrl,
                    method: request.method(),
                    resourceType: request.resourceType()
                },
                parsed
            });
        });
    }

    /**
     * Get collected events.
     *
     * @returns {Array<Object>}
     */
    getEvents() {
        return this.events;
    }
}
