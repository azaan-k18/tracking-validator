import { BaseProvider } from "../core/BaseProvider.js";

/**
 * Google Ads Conversion provider parser.
 *
 * @class
 * @extends BaseProvider
 */
export class GoogleAdsProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "GOOGLEADS";
        this._pattern = /\/pagead\/(viewthrough)?conversion/i;
        this._name = "Google Ads";
        this._type = "marketing";
    }

    get columnMapping() {
        return {
            account: "account",
            requestType: "requestType"
        };
    }

    get groups() {
        return [
            { key: "general", name: "General" }
        ];
    }

    get keys() {
        return {
            label: { name: "Conversion Label", group: "general" },
            gclid: { name: "Google Click ID", group: "general" },
            value: { name: "Conversion Value", group: "general" }
        };
    }

    handleCustom(url) {
        const match = url.pathname.match(/\/(?:AW-)?(\d+)/);
        const accountId = match ? `AW-${match[1]}` : null;

        const results = [];

        if (accountId) {
            results.push({
                key: "account",
                field: "Account ID",
                value: accountId,
                group: "general"
            });
        }

        results.push({
            key: "requestType",
            field: "Request Type",
            value: "Conversion",
            group: "general"
        });

        return results;
    }
}