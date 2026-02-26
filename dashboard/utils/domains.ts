export interface DomainOption {
    key: string;
    label: string;
}

export const DOMAIN_OPTIONS: DomainOption[] = [
    { key: "indianexpress", label: "Indian Express" },
    { key: "financialexpress", label: "Financial Express" },
    { key: "loksatta", label: "Loksatta" },
    { key: "jansatta", label: "Jansatta" }
];

export const DEFAULT_DOMAIN = "indianexpress";
