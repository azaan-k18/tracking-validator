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
 * Theme provider for dashboard UI.
 *
 * @param props Provider props.
 * @returns {JSX.Element}
 */
export function ThemeProvider({ children }: { children: React.ReactNode }): JSX.Element {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark") {
            setTheme(saved);
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("theme-light", theme === "light");
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const value = useMemo(() => {
        return {
            theme,
            toggleTheme: () => {
                setTheme((current) => (current === "dark" ? "light" : "dark"));
            }
        };
    }, [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Consume current theme context.
 *
 * @returns {ThemeContextValue}
 */
export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }

    return context;
}
