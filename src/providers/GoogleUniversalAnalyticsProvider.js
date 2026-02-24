import { BaseProvider } from "../core/BaseProvider.js";

/**
 * Google Universal Analytics provider.
 *
 * @class
 * @extends BaseProvider
 */
export class GoogleUniversalAnalyticsProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "UNIVERSALANALYTICS";
        this._pattern = /google-analytics\.com\/collect/i;
        this._name = "Google Universal Analytics";
        this._type = "analytics";
    }

    get columnMapping() {
        return {
            account: "tid",
            requestType: "t"
        };
    }

    get groups() {
        return [
            { key: "general", name: "General" },
            { key: "events", name: "Events" },
            { key: "campaign", name: "Campaign" }
        ];
    }

    get keys() {
        return {
            v: { name: "Protocol Version", group: "general" },
            tid: { name: "Tracking ID", group: "general" },
            cid: { name: "Client ID", group: "general" },
            t: { name: "Hit Type", group: "general" },
            ec: { name: "Event Category", group: "events" },
            ea: { name: "Event Action", group: "events" },
            el: { name: "Event Label", group: "events" },
            gclid: { name: "Google Click ID", group: "campaign" }
        };
    }
}