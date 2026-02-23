/**
 * Provider registry for request matching and parsing.
 *
 * @class
 */
export class ProviderRegistry {
    /**
     * Create a registry.
     *
     * @param {Array<Object>} providers Provider instances.
     */
    constructor(providers = []) {
        this.providers = providers;
    }

    /**
     * Parse a request with the first matching provider.
     *
     * @param {string} url Request URL.
     * @param {string|Object} postData Optional POST data.
     * @returns {{provider: Object, data: Array<Object>}|null}
     */
    parseRequest(url, postData = "") {
        const provider = this.providers.find((entry) => entry.checkUrl(url));
        if (!provider) {
            return null;
        }

        return provider.parseUrl(url, postData);
    }
}
