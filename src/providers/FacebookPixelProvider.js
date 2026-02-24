import { BaseProvider } from "../core/BaseProvider.js";

/**
 * Facebook Pixel provider parser.
 *
 * @class
 * @extends BaseProvider
 */
export class FacebookPixelProvider extends BaseProvider {
    constructor() {
        super();
        this._key = "FACEBOOKPIXEL";
        this._pattern = /facebook\.com\/tr\/?\?id=/i;
        this._name = "Facebook Pixel";
        this._type = "marketing";
    }

    /**
     * Retrieve column mappings.
     *
     * @returns {{account: string, requestType: string}}
     */
    get columnMapping() {
        return {
            account: "id",
            requestType: "ev"
        };
    }

    /**
     * Retrieve group metadata.
     *
     * @returns {Array<Object>}
     */
    get groups() {
        return [
            {
                key: "general",
                name: "General"
            }
        ];
    }
}
