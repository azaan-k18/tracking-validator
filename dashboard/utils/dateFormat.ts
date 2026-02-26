/**
 * Pad numeric date parts to two digits.
 *
 * @param value Number to pad.
 * @returns {string}
 */
function pad2(value: number): string {
    return value.toString().padStart(2, "0");
}

/**
 * Parse ISO date safely.
 *
 * @param value Date input.
 * @returns {Date | null}
 */
function parseDate(value: string | null | undefined): Date | null {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

/**
 * Format date-time consistently across server and client in UTC.
 *
 * @param value ISO date string.
 * @returns {string}
 */
export function formatDateTime(value: string | null | undefined): string {
    const date = parseDate(value);
    if (!date) {
        return "-";
    }

    const day = pad2(date.getUTCDate());
    const month = pad2(date.getUTCMonth() + 1);
    const year = date.getUTCFullYear();
    const hours = pad2(date.getUTCHours());
    const minutes = pad2(date.getUTCMinutes());
    const seconds = pad2(date.getUTCSeconds());

    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} UTC`;
}

/**
 * Format time consistently across server and client in UTC.
 *
 * @param value ISO date string.
 * @returns {string}
 */
export function formatTime(value: string | null | undefined): string {
    const date = parseDate(value);
    if (!date) {
        return "-";
    }

    const hours = pad2(date.getUTCHours());
    const minutes = pad2(date.getUTCMinutes());
    const seconds = pad2(date.getUTCSeconds());

    return `${hours}:${minutes}:${seconds} UTC`;
}
