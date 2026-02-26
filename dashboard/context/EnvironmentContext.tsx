"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_ENVIRONMENT, ENVIRONMENT_OPTIONS, type EnvironmentKey } from "@/utils/environments";

interface EnvironmentContextValue {
    environment: EnvironmentKey;
    setEnvironment: (environment: EnvironmentKey) => void;
}

const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);
const STORAGE_KEY = "tracking-validator-environment";

/**
 * Environment context provider.
 *
 * @param props Provider props.
 * @returns {JSX.Element}
 */
export function EnvironmentProvider({ children }: { children: React.ReactNode }): JSX.Element {
    const [environment, setEnvironmentState] = useState<EnvironmentKey>(DEFAULT_ENVIRONMENT);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && ENVIRONMENT_OPTIONS.includes(saved as EnvironmentKey)) {
            setEnvironmentState(saved as EnvironmentKey);
        }
    }, []);

    const setEnvironment = (next: EnvironmentKey) => {
        setEnvironmentState(next);
        localStorage.setItem(STORAGE_KEY, next);
    };

    const value = useMemo(() => ({ environment, setEnvironment }), [environment]);

    return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}

/**
 * Access environment context.
 *
 * @returns {EnvironmentContextValue}
 */
export function useEnvironment(): EnvironmentContextValue {
    const context = useContext(EnvironmentContext);
    if (!context) {
        throw new Error("useEnvironment must be used inside EnvironmentProvider");
    }

    return context;
}
