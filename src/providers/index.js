import { ComscoreProvider } from "./ComscoreProvider.js";
import { FacebookPixelProvider } from "./FacebookPixelProvider.js";
import { GoogleAdsProvider } from "./GoogleAdsProvider.js";
import { GoogleUniversalAnalyticsProvider } from "./GoogleUniversalAnalyticsProvider.js";
import { GoogleAnalytics4Provider } from "./GoogleAnalytics4Provider.js";
import { GoogleTagManagerProvider } from "./GoogleTagManagerProvider.js";

/**
 * Build provider instances from configuration.
 *
 * @param {Array<string>} keys Provider keys.
 * @returns {Array<Object>}
 */
export function buildProviders(keys = []) {
    const registry = {
        COMSCORE: () => new ComscoreProvider(),
        FACEBOOKPIXEL: () => new FacebookPixelProvider(),
        GOOGLEADS: () => new GoogleAdsProvider(),
        UNIVERSALANALYTICS: () => new GoogleUniversalAnalyticsProvider(),
        GOOGLEANALYTICS4: () => new GoogleAnalytics4Provider(),
        GOOGLETAGMANAGER: () => new GoogleTagManagerProvider()
    };

    return keys
        .map((key) => String(key || "").toUpperCase())
        .filter((key) => registry[key])
        .map((key) => registry[key]());
}