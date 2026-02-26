"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "tracking-validator-theme";

/**
 * Theme context provider with localStorage persistence.
 *
 * @param props Provider props.
 * @returns {JSX.Element}
 */
export function ThemeProvider({ children }: { children: React.ReactNode }): JSX.Element {
    const [theme, setTheme] = useState<Theme>("dark");
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark") {
            setTheme(saved);
        }
        setHydrated(true);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle("theme-light", theme === "light");
        if (hydrated) {
            localStorage.setItem(STORAGE_KEY, theme);
        }
    }, [theme, hydrated]);

    const value = useMemo(() => {
        return {
            theme,
            toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark"))
        };
    }, [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Access theme context.
 *
 * @returns {ThemeContextValue}
 */
export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used inside ThemeProvider");
    }

    return context;
}
