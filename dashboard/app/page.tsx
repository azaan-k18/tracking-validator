"use client";

import { useEffect, useState } from "react";
import { RunsDashboard } from "@/components/RunsDashboard";
import { BuildNowCard } from "@/components/widgets/BuildNowCard";
import { Card, CardContent } from "@/components/ui/card";
import { getRuns } from "@/services/api";
import { useDomain } from "@/context/DomainContext";
import { useEnvironment } from "@/context/EnvironmentContext";
import type { RunRecord } from "@/lib/types";

/**
 * Overview page.
 *
 * @returns {JSX.Element}
 */
export default function HomePage(): JSX.Element {
    const [runs, setRuns] = useState<RunRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { domain } = useDomain();
    const { environment } = useEnvironment();

    useEffect(() => {
        let mounted = true;

        async function loadRuns() {
            try {
                setLoading(true);
                setError(null);
                const data = await getRuns(domain, environment);
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
    }, [domain, environment]);

    if (loading) {
        return (
            <main className="dashboard-container">
                <BuildNowCard />
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">Loading runs...</CardContent>
                </Card>
            </main>
        );
    }

    if (error) {
        return (
            <main className="dashboard-container">
                <BuildNowCard />
                <Card>
                    <CardContent className="py-10 text-center text-red-250">{error}</CardContent>
                </Card>
            </main>
        );
    }

    return (
        <main className="dashboard-container">
            <BuildNowCard />
            <RunsDashboard runs={runs} selectedDomain={domain} selectedEnvironment={environment} />
        </main>
    );
}
