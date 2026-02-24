export const providerNameMap: Record<string, string> = {
    GOOGLEANALYTICS4: "Google Analytics 4",
    GOOGLETAGMANAGER: "Google Tag Manager",
    UNIVERSALANALYTICS: "Google Universal Analytics",
    FACEBOOKPIXEL: "Facebook Pixel",
    GOOGLEADS: "Google Ads",
    COMSCORE: "Comscore"
};

/**
 * Convert provider key to readable label.
 *
 * @param providerKey Provider key.
 * @returns {string}
 */
export function getProviderDisplayName(providerKey: string | null | undefined): string {
    const key = String(providerKey || "").toUpperCase();
    return providerNameMap[key] || key || "Unknown";
}
