"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDomain } from "@/context/DomainContext";
import { useEnvironment } from "@/context/EnvironmentContext";
import { triggerBuild } from "@/services/api";

interface ToastState {
    type: "success" | "error";
    message: string;
}

/**
 * Build trigger widget.
 *
 * @returns {JSX.Element}
 */
export function BuildNowCard(): JSX.Element {
    const { domain } = useDomain();
    const { environment } = useEnvironment();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<ToastState | null>(null);

    useEffect(() => {
        if (!toast) {
            return undefined;
        }

        const timeout = window.setTimeout(() => {
            setToast(null);
        }, 3500);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [toast]);

    const onBuildNow = async () => {
        try {
            setIsSubmitting(true);
            await triggerBuild(domain, environment);
            setToast({
                type: "success",
                message: `Build started for ${domain}/${environment}.`
            });
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? String(error.response?.data?.error || error.message || "Failed to start build.")
                : error instanceof Error
                    ? error.message
                    : "Failed to start build.";
            setToast({
                type: "error",
                message: errorMessage
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {toast ? (
                <div className={`fixed right-4 top-20 z-50 rounded-xl border px-4 py-3 text-sm shadow-xl ${toast.type === "success" ? "border-green-500/50 bg-green-500/10 text-green-200" : "border-red-500/50 bg-red-500/10 text-red-200"}`}>
                    {toast.message}
                </div>
            ) : null}
            <Card className="build-widget">
                <CardHeader>
                    <CardTitle>Trigger New Build</CardTitle>
                    <CardDescription>
                        <span className="block">
                            Run tracking validation for the selected website and environment.
                        </span>
                        <span className="mt-1 block">
                            Selected: {domain} / {environment}
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button type="button" onClick={onBuildNow} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <span className="inline-flex items-center gap-2">
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                <span>Starting...</span>
                            </span>
                        ) : "Build Now"}
                    </Button>
                </CardContent>
            </Card>
        </>
    );
}
