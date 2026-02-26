"use client";

import Link from "next/link";
import { Menu, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EnvironmentDrawer } from "@/components/layout/EnvironmentDrawer";
import { useTheme } from "@/context/ThemeContext";

/**
 * Global persistent header.
 *
 * @returns {JSX.Element}
 */
export function Header(): JSX.Element {
    const { theme, toggleTheme } = useTheme();
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <>
            <header className="dashboard-header">
                <div className="dashboard-header-inner">
                    <Link href="/" className="dashboard-title-link">Express Tracking Validator</Link>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="secondary" size="icon" onClick={() => setDrawerOpen(true)} aria-label="Open environment selector">
                            <Menu size={16} />
                        </Button>
                        <Button type="button" variant="secondary" size="sm" className="theme-toggle" onClick={toggleTheme}>
                            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                            <span>{theme === "dark" ? "Light" : "Dark"}</span>
                        </Button>
                    </div>
                </div>
            </header>
            <EnvironmentDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </>
    );
}
