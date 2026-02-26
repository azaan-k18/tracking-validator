import { RunDetailDashboard } from "@/components/RunDetailDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { getRunBundle } from "@/services/serverApi";
import { DEFAULT_DOMAIN } from "@/utils/domains";
import { DEFAULT_ENVIRONMENT } from "@/utils/environments";

interface RunDetailPageProps {
    params: {
        id: string;
    };
    searchParams: {
        site?: string;
        environment?: string;
    };
}

/**
 * Run detail page (server-rendered data fetch).
 *
 * @param props Route params and query.
 * @returns {Promise<JSX.Element>}
 */
export default async function RunDetailPage({ params, searchParams }: RunDetailPageProps): Promise<JSX.Element> {
    const runId = params.id;
    const site = searchParams.site || DEFAULT_DOMAIN;
    const environment = searchParams.environment || DEFAULT_ENVIRONMENT;

    try {
        const { run, pages, events, rules } = await getRunBundle(runId, site, environment);
        return <RunDetailDashboard run={run} pages={pages} events={events} rules={rules} />;
    } catch (error) {
        return (
            <main className="dashboard-container">
                <Card>
                    <CardContent className="py-10 text-center text-red-250">
                        {error instanceof Error ? error.message : "Failed to load run details"}
                    </CardContent>
                </Card>
            </main>
        );
    }
}
