"use client";

import { useEffect, useState } from "react";
import { RunsDashboard } from "@/components/RunsDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { getRuns } from "@/services/api";
import type { RunRecord } from "@/lib/types";

/**
 * Overview page.
 *
 * @returns {JSX.Element}
 */
export default function HomePage(): JSX.Element {
    const [runs, setRuns] = useState<RunRecord[]>([]);
    const [selectedSite, setSelectedSite] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function loadRuns() {
            try {
                setLoading(true);
                setError(null);
                const data = await getRuns(selectedSite);
                if (mounted) {
                    setRuns(data);
                }
            } catch (loadError) {
                if (mounted) {
                    setError(loadError instanceof Error ? loadError.message : "Failed to load runs");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadRuns();
        return () => {
            mounted = false;
        };
    }, [selectedSite]);

    if (loading) {
        return (
            <main className="dashboard-container">
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">Loading runs...</CardContent>
                </Card>
            </main>
        );
    }

    if (error) {
        return (
            <main className="dashboard-container">
                <Card>
                    <CardContent className="py-10 text-center text-red-300">{error}</CardContent>
                </Card>
            </main>
        );
    }

    return <RunsDashboard runs={runs} selectedSite={selectedSite} onSiteChange={setSelectedSite} />;
}
