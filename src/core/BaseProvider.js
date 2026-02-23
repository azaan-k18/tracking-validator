/**
 * Generic Base Provider.
 *
 * @class
 */
export class BaseProvider {
    /**
     * Create a provider.
     */
    constructor() {
        this._key = "";
        this._pattern = /.*/;
        this._name = "";
        this._type = "";
        this._keywords = [];
    }

    /**
     * Get provider key.
     *
     * @returns {string}
     */
    get key() {
        return this._key;
    }

    /**
     * Get provider name.
     *
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Get provider type.
     *
     * @returns {string}
     */
    get type() {
        return this._type;
    }

    /**
     * Get provider matcher.
     *
     * @returns {RegExp}
     */
    get pattern() {
        return this._pattern;
    }

    /**
     * Get column mapping for account/request type fields.
     *
     * @returns {Object}
     */
    get columnMapping() {
        return {};
    }

    /**
     * Get supported groups.
     *
     * @returns {Array<Object>}
     */
    get groups() {
        return [];
    }

    /**
     * Get known query keys.
     *
     * @returns {Object}
     */
    get keys() {
        return {};
    }

    /**
     * Check whether URL matches this provider.
     *
     * @param {string} rawUrl URL to test.
     * @returns {boolean}
     */
    checkUrl(rawUrl) {
        return this.pattern.test(rawUrl);
    }

    /**
     * Parse URL and optional POST data to a normalized event.
     *
     * @param {string} rawUrl URL to parse.
     * @param {string|Object} postData Optional POST payload.
     * @returns {{provider: Object, data: Array<Object>}}
     */
    parseUrl(rawUrl, postData = "") {
        const url = new URL(rawUrl);
        const params = new URLSearchParams(url.search);
        const postParams = this.parsePostData(postData);
        const data = [];

        postParams.forEach((pair) => {
            params.append(pair[0], pair[1]);
        });

        for (const param of params) {
            const key = param[0];
            const value = param[1];
            const result = this.handleQueryParam(key, value);
            if (typeof result === "object" && result !== null) {
                data.push(result);
            }
        }

        const customData = this.handleCustom(url, params);
        if (Array.isArray(customData) && customData.length > 0) {
            data.push(...customData);
        }

        return {
            provider: {
                key: this.key,
                name: this.name,
                type: this.type,
                columns: this.columnMapping,
                groups: this.groups
            },
            data
        };
    }

    /**
     * Parse POST body into key-value tuples.
     *
     * @param {string|Object} postData Payload.
     * @returns {Array<Array<string>>}
     */
    parsePostData(postData = "") {
        const params = [];

        if (typeof postData === "string" && postData.length > 0) {
            try {
                const parsed = JSON.parse(postData);
                const recurse = (value, prop) => {
                    if (Object(value) !== value) {
                        params.push([prop, String(value)]);
                        return;
                    }

                    if (Array.isArray(value)) {
                        if (value.length === 0) {
                            params.push([prop, ""]);
                            return;
                        }

                        value.forEach((entry, index) => {
                            recurse(entry, `${prop}[${index}]`);
                        });
                        return;
                    }

                    const keys = Object.keys(value);
                    if (keys.length === 0 && prop) {
                        params.push([prop, ""]);
                        return;
                    }

                    keys.forEach((key) => {
                        const next = prop ? `${prop}.${key}` : key;
                        recurse(value[key], next);
                    });
                };

                recurse(parsed, "");
            } catch {
                const fallback = new URLSearchParams(postData);
                for (const pair of fallback) {
                    params.push([pair[0], pair[1]]);
                }
            }
            return params;
        }

        if (postData && typeof postData === "object") {
            Object.entries(postData).forEach((entry) => {
                params.push([entry[0], String(entry[1])]);
            });
        }

        return params;
    }

    /**
     * Map a parameter into the normalized shape.
     *
     * @param {string} name Raw key.
     * @param {string} value Raw value.
     * @returns {{key: string, field: string, value: string, group: string}|undefined}
     */
    handleQueryParam(name, value) {
        const param = this.keys[name] || {};
        if (param.hidden) {
            return;
        }

        return {
            key: name,
            field: param.name || name,
            value,
            group: param.group || "other"
        };
    }

    /**
     * Add derived parameters.
     *
     * @param {URL} url URL object.
     * @param {URLSearchParams} params All params.
     * @returns {Array<Object>}
     */
    handleCustom(url, params) {
        void url;
        void params;
        return [];
    }
}
