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
     * @param {{retainEvents?: boolean, onEvent?: Function, debug?: boolean}} options Collector options.
     */
    constructor(providerRegistry, options = {}) {
        this.providerRegistry = providerRegistry;
        this.retainEvents = options.retainEvents ?? true;
        this.onEvent = options.onEvent;
        this.debug = options.debug ?? String(process.env.DEBUG || "").toLowerCase() === "true";
        this.events = [];
    }

    /**
     * Attach listeners to page and collect parsed events.
     *
     * @param {import("playwright").Page} page Playwright page.
     * @param {string} pageUrl Current page URL.
     */
    attach(page, pageUrl) {
        page.on("request", (request) => {
            const requestUrl = this.normalizeUrl(request.url());
            const resourceType = request.resourceType();
            if (this.debug) {
                console.log(`[RequestCollector][${resourceType}] ${request.method()} ${requestUrl}`);
            }
            let postData = "";

            if (request.method() !== "GET") {
                postData = request.postData() || "";
            }

            const parsed = this.providerRegistry.parseRequest(requestUrl, postData);
            if (!parsed) {
                return;
            }

            const event = {
                timestamp: new Date().toISOString(),
                pageUrl,
                request: {
                    url: requestUrl,
                    method: request.method(),
                    resourceType
                },
                parsed
            };

            if (this.retainEvents) {
                this.events.push(event);
            }

            if (typeof this.onEvent === "function") {
                this.onEvent(event);
            }
        });
    }

    /**
     * Normalize URL for provider parsing.
     *
     * @param {string} rawUrl Raw request URL.
     * @returns {string}
     */
    normalizeUrl(rawUrl) {
        try {
            const parsed = new URL(rawUrl);
            parsed.hash = "";
            return parsed.toString();
        } catch {
            return rawUrl;
        }
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
