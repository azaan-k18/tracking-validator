"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";

/**
 * Global theme toggle button.
 *
 * @returns {JSX.Element}
 */
export function ThemeToggle(): JSX.Element {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button type="button" variant="secondary" size="sm" className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </Button>
    );
}
