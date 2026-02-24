"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProviderDisplayName } from "@/utils/providerNames";

interface ProviderChartProps {
    data: Array<{
        provider: string;
        count: number;
    }>;
}

/**
 * Provider distribution chart.
 *
 * @param props Chart props.
 * @returns {JSX.Element}
 */
export function ProviderChart({ data }: ProviderChartProps): JSX.Element {
    const chartData = data.map((entry) => ({
        ...entry,
        providerLabel: getProviderDisplayName(entry.provider)
    }));

    return (
        <Card className="bg-card/85">
            <CardHeader>
                <CardTitle>Provider Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                            <XAxis dataKey="providerLabel" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                            <Tooltip cursor={{ fill: "rgba(148,163,184,0.12)" }} />
                            <Bar dataKey="count" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
