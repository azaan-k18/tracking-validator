"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_DOMAIN, DOMAIN_OPTIONS } from "@/utils/domains";

interface DomainContextValue {
    domain: string;
    setDomain: (domain: string) => void;
}

const DomainContext = createContext<DomainContextValue | null>(null);
const STORAGE_KEY = "tracking-validator-domain";

/**
 * Domain context provider.
 *
 * @param props Provider props.
 * @returns {JSX.Element}
 */
export function DomainProvider({ children }: { children: React.ReactNode }): JSX.Element {
    const [domain, setDomainState] = useState<string>(DEFAULT_DOMAIN);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && DOMAIN_OPTIONS.some((option) => option.key === saved)) {
            setDomainState(saved);
        }
    }, []);

    const setDomain = (next: string) => {
        setDomainState(next);
        localStorage.setItem(STORAGE_KEY, next);
    };

    const value = useMemo(() => ({ domain, setDomain }), [domain]);

    return <DomainContext.Provider value={value}>{children}</DomainContext.Provider>;
}

/**
 * Access domain context.
 *
 * @returns {DomainContextValue}
 */
export function useDomain(): DomainContextValue {
    const context = useContext(DomainContext);
    if (!context) {
        throw new Error("useDomain must be used inside DomainProvider");
    }

    return context;
}
