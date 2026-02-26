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
        this._pattern = /analytics\.google\.com\/g\/collect/i;
        this._name = "Google Analytics 4";
        this._type = "analytics";
    }

    /**
     * Check whether URL is a GA4 page_view request.
     *
     * @param {string} rawUrl Request URL.
     * @returns {boolean}
     */
    checkUrl(rawUrl) {
        try {
            const parsed = new URL(rawUrl);
            const host = parsed.hostname.toLowerCase();
            const path = parsed.pathname.toLowerCase();
            const params = parsed.searchParams;
            const tid = String(params.get("tid") || "").trim();
            const eventName = String(params.get("en") || "").trim().toLowerCase();

            if (host !== "analytics.google.com" && host !== "www.google-analytics.com") {
                return false;
            }

            if (!path.includes("/g/collect")) {
                return false;
            }

            if (!/^G-[A-Z0-9]+$/i.test(tid)) {
                return false;
            }

            return eventName === "page_view";
        } catch {
            return false;
        }
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
