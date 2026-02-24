import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
    title: "Express Tracking Validator",
    description: "Dashboard for tracking validator runs"
};

/**
 * Root application layout.
 *
 * @param props Layout props.
 * @returns {JSX.Element}
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): JSX.Element {
    return (
        <html lang="en">
            <body>
                <ThemeProvider>
                    <header className="dashboard-header">
                        <div className="dashboard-header-inner">
                            <h1 className="dashboard-title">Tracking Validator</h1>
                            <ThemeToggle />
                        </div>
                    </header>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
