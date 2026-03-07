import { type ClassValue, clsx } from "clsx";

/**
 * Merge class names safely.
 *
 * @param inputs Class values.
 * @returns {string}
 */
export function cn(...inputs: ClassValue[]): string {
    return clsx(inputs);
}
