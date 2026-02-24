import { BaseProvider } from "../core/BaseProvider.js";

/**
 * Google Analytics 4 provider parser.
 *
 * @class
 * @extends BaseProvider
 */
export class GoogleAnalytics4Provider extends BaseProvider {
    constructor() {
        super();
        this._key = "GOOGLEANALYTICS4";
        this._pattern = /\/g\/collect/i;
        this._name = "Google Analytics 4";
        this._type = "analytics";
    }

    get columnMapping() {
        return {
            account: "tid",
            requestType: "en"
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
            tid: { name: "Measurement ID", group: "general" },
            cid: { name: "Client ID", group: "general" },
            en: { name: "Event Name", group: "events" },
            dl: { name: "Page URL", group: "general" },
            dt: { name: "Page Title", group: "general" }
        };
    }
}