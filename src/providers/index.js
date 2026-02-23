import { ComscoreProvider } from "./ComscoreProvider.js";

/**
 * Build provider instances from configuration.
 *
 * @param {Array<string>} keys Provider keys.
 * @returns {Array<Object>}
 */
export function buildProviders(keys = []) {
    const registry = {
        COMSCORE: () => new ComscoreProvider()
    };

    return keys
        .map((key) => String(key || "").toUpperCase())
        .filter((key) => registry[key])
        .map((key) => registry[key]());
}
