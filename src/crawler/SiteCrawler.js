/**
 * Breadth-first site crawler.
 *
 * @class
 */
export class SiteCrawler {
    /**
     * Create crawler settings.
     *
     * @param {{maxDepth: number, maxUrls: number, sameOriginOnly: boolean, include: Array<string>, exclude: Array<string>}} options Settings.
     */
    constructor(options = {}) {
        this.maxDepth = options.maxDepth ?? 2;
        this.maxUrls = options.maxUrls ?? 5;
        this.sameOriginOnly = options.sameOriginOnly ?? true;
        this.include = (options.include || []).map((entry) => new RegExp(entry));
        this.exclude = (options.exclude || []).map((entry) => new RegExp(entry));
    }

    /**
     * Crawl links using a provided page factory.
     *
     * @param {string} startUrl Entry URL.
     * @param {function(): Promise<import("playwright").Page>} newPage Function creating a page.
     * @returns {Promise<Array<{url: string, depth: number}>>}
     */
    async crawl(startUrl, newPage) {
        const seed = new URL(startUrl);
        const queue = [{ url: seed.toString(), depth: 0 }];
        const visited = new Set();
        const discovered = [];

        while (queue.length > 0 && discovered.length < this.maxUrls) {
            const current = queue.shift();
            if (!current || visited.has(current.url)) {
                continue;
            }

            visited.add(current.url);

            if (current.depth !== 0 && !this.shouldInclude(current.url)) {
                continue;
            }

            discovered.push(current);
            if (current.depth >= this.maxDepth) {
                continue;
            }

            const page = await newPage();
            try {
                await page.goto(current.url, { waitUntil: "domcontentloaded", timeout: 30000 });
                const links = await page.$$eval("a[href]", (anchors) => anchors.map((anchor) => anchor.href));

                links.forEach((link) => {
                    if (visited.has(link)) {
                        return;
                    }

                    try {
                        const parsed = new URL(link);
                        if (this.sameOriginOnly && parsed.origin !== seed.origin) {
                            return;
                        }

                        if (!this.shouldInclude(parsed.toString())) {
                            return;
                        }

                        queue.push({ url: parsed.toString(), depth: current.depth + 1 });
                    } catch {
                        // Ignore invalid URLs.
                    }
                });
            } catch {
                // Continue crawling even if one page fails.
            } finally {
                await page.close();
            }
        }

        return discovered;
    }

    /**
     * Check if URL passes include/exclude filters.
     *
     * @param {string} url URL to evaluate.
     * @returns {boolean}
     */
    shouldInclude(url) {
        if (this.exclude.some((pattern) => pattern.test(url))) {
            return false;
        }

        if (this.include.length === 0) {
            return true;
        }

        return this.include.some((pattern) => pattern.test(url));
    }
}
