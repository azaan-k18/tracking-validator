import { BaseProvider } from "../core/BaseProvider.js";

/**
 * Google Tag Manager provider parser.
 *
 * @class
 * @extends BaseProvider
 */
export class GoogleTagManagerProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "GOOGLETAGMANAGER";
        this._pattern = /googletagmanager\.com\/gtm\.js/i;
        this._name = "Google Tag Manager";
        this._type = "tagmanager";
    }

    get columnMapping() {
        return {
            account: "id",
            requestType: "_requestType"
        };
    }

    get groups() {
        return [
            { key: "general", name: "General" }
        ];
    }

    get keys() {
        return {
            id: { name: "Container ID", group: "general" },
            l: { name: "Data Layer Name", group: "general" }
        };
    }

    handleCustom() {
        return [
            {
                key: "_requestType",
                value: "Library Load",
                hidden: true
            }
        ];
    }
}