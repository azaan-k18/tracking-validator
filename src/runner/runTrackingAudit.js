import { chromium } from "playwright";
import { SiteCrawler } from "../crawler/SiteCrawler.js";
import { ProviderRegistry } from "../core/ProviderRegistry.js";
import { RequestCollector } from "../core/RequestCollector.js";
import { buildProviders } from "../providers/index.js";
import { RuleEngine } from "../validation/RuleEngine.js";
import { ReportWriter } from "../reporting/ReportWriter.js";

/**
 * Run tracking audit end-to-end.
 *
 * @param {Object} config Runtime configuration.
 * @returns {Promise<Object>}
 */
export async function runTrackingAudit(config) {
    const startedAt = new Date().toISOString();
    const browser = await chromium.launch({
        headless: config.runtime?.headless ?? true
    });

    const context = await browser.newContext({
        userAgent: config.runtime?.userAgent || undefined
    });

    const crawler = new SiteCrawler(config.crawl || {});
    const providerRegistry = new ProviderRegistry(buildProviders(config.providers || []));
    const collector = new RequestCollector(providerRegistry);
    const ruleEngine = new RuleEngine(config.rules || []);

    try {
        const urls = await crawler.crawl(config.startUrl, async () => context.newPage());

        for (const target of urls) {
            const page = await context.newPage();
            collector.attach(page, target.url);

            try {
                console.log('Visting Page' + target.url)
                await page.goto(target.url, { waitUntil: "commit", timeout: 4000 });
                await page.waitForTimeout(config.runtime?.settleMs ?? 1000);
            } catch {
                // Continue if page fails.
            } finally {
                await page.close();
            }
        }

        const events = collector.getEvents();
        const results = ruleEngine.evaluate(events, urls);
        const finishedAt = new Date().toISOString();
        const payload = {
            meta: {
                startedAt,
                finishedAt,
                startUrl: config.startUrl,
                pagesCrawled: urls.length,
                eventsCaptured: events.length
            },
            crawl: urls,
            results,
            events
        };

        const reportWriter = new ReportWriter();
        const output = await reportWriter.write(config.output?.directory || "results", payload);

        return {
            payload,
            output
        };
    } finally {
        await context.close();
        await browser.close();
    }
}
