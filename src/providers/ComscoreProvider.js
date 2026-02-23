import { BaseProvider } from "../core/BaseProvider.js";

/**
 * Comscore provider parser.
 *
 * @class
 * @extends BaseProvider
 */
export class ComscoreProvider extends BaseProvider {
    /**
     * Create Comscore provider.
     */
    constructor() {
        super();
        this._key = "COMSCORE";
        this._pattern = /sb\.scorecardresearch\.com(?!.*\.js($|[?#]))/;
        this._name = "Comscore";
        this._type = "marketing";
    }

    /**
     * Retrieve column mappings.
     *
     * @returns {{account: string, requestType: string}}
     */
    get columnMapping() {
        return {
            account: "c2",
            requestType: "c1"
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
                key: "custom",
                name: "Custom"
            }
        ];
    }

    /**
     * Parse query params into normalized fields.
     *
     * @param {string} name Parameter name.
     * @param {string} value Parameter value.
     * @returns {{key: string, field: string, value: string, group: string}|undefined}
     */
    handleQueryParam(name, value) {
        const customRegex = /^c\S+$/;
        if (customRegex.test(name)) {
            return {
                key: name,
                field: name,
                value,
                group: "custom"
            };
        }

        return super.handleQueryParam(name, value);
    }
}
