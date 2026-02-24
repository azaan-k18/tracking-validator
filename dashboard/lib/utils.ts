import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely.
 *
 * @param inputs Class values.
 * @returns {string}
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
