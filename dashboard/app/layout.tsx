import type { Metadata } from "next";
import "@/styles/globals.css";
import { Header } from "@/components/layout/Header";
import { Navbar } from "@/components/layout/Navbar";
import { AppProviders } from "@/context/AppProviders";

export const metadata: Metadata = {
    title: "Express Tracking Validator",
    description: "Dashboard for tracking validator runs"
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('tracking-validator-theme');
    if (stored === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  } catch (e) {}
})();
`;

/**
 * Root application layout.
 *
 * @param props Layout props.
 * @returns {JSX.Element}
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): JSX.Element {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
            </head>
            <body>
                <AppProviders>
                    <Header />
                    <Navbar />
                    {children}
                </AppProviders>
            </body>
        </html>
    );
}
