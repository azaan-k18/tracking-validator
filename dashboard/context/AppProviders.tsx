"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { EnvironmentProvider } from "@/context/EnvironmentContext";
import { DomainProvider } from "@/context/DomainContext";

/**
 * Combined app providers.
 *
 * @param props Provider props.
 * @returns {JSX.Element}
 */
export function AppProviders({ children }: { children: React.ReactNode }): JSX.Element {
    return (
        <ThemeProvider>
            <EnvironmentProvider>
                <DomainProvider>{children}</DomainProvider>
            </EnvironmentProvider>
        </ThemeProvider>
    );
}
