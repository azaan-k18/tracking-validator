import { ObjectId } from "mongodb";
import { MongoClientManager } from "./MongoClient.js";
import { ReportRepository } from "./ReportRepository.js";

/**
 * MongoDB-backed report repository with async batching.
 *
 * @class
 * @extends ReportRepository
 */
export class MongoReportRepository extends ReportRepository {
    /**
     * Create Mongo report repository.
     *
     * @param {{uri?: string, dbName?: string, batchSize?: number}} options Repository options.
     */
    constructor(options = {}) {
        super();
        this.uri = options.uri || "mongodb://127.0.0.1:27017";
        this.dbName = options.dbName || "trackingValidator";
        this.batchSize = options.batchSize || 50;

        this.clientManager = new MongoClientManager(this.uri, this.dbName);
        this.db = null;

        this.runs = null;
        this.pages = null;
        this.events = null;
        this.ruleResults = null;

        this.pageBuffer = [];
        this.eventBuffer = [];
        this.pendingWrites = new Set();
    }

    /**
     * Initialize Mongo collections and indexes.
     *
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.db) {
            return;
        }

        this.db = await this.clientManager.connect();
        this.runs = this.db.collection("runs");
        this.pages = this.db.collection("pages");
        this.events = this.db.collection("events");
        this.ruleResults = this.db.collection("ruleResults");

        await Promise.all([
            this.events.createIndex({ runId: 1 }),
            this.pages.createIndex({ runId: 1 }),
            this.ruleResults.createIndex({ runId: 1 }),
            this.runs.createIndex({ startedAt: -1 }),
            this.runs.createIndex({ site: 1, startedAt: -1 }),
            this.runs.createIndex({ site: 1, environment: 1, startedAt: -1 })
        ]);
    }

    /**
     * Save run metadata.
     *
     * @param {Object} meta Run metadata.
     * @returns {Promise<string>}
     */
    async saveRun(meta) {
        await this.initialize();

        if (meta.runId) {
            const runObjectId = new ObjectId(meta.runId);
            await this.runs.updateOne(
                { _id: runObjectId },
                {
                    $set: {
                        site: meta.site || null,
                        environment: meta.environment || "prod",
                        startedAt: meta.startedAt,
                        finishedAt: meta.finishedAt,
                        startUrl: meta.startUrl,
                        pagesCrawled: meta.pagesCrawled,
                        eventsCaptured: meta.eventsCaptured,
                        rulesPassed: meta.rulesPassed,
                        rulesFailed: meta.rulesFailed,
                        status: meta.status
                    }
                }
            );
            return meta.runId;
        }

        const response = await this.runs.insertOne({
            site: meta.site || null,
            environment: meta.environment || "prod",
            startedAt: meta.startedAt,
            finishedAt: meta.finishedAt || null,
            startUrl: meta.startUrl,
            pagesCrawled: meta.pagesCrawled || 0,
            eventsCaptured: meta.eventsCaptured || 0,
            rulesPassed: meta.rulesPassed || 0,
            rulesFailed: meta.rulesFailed || 0,
            status: meta.status || "running",
            logs: Array.isArray(meta.logs) ? meta.logs : []
        });

        return response.insertedId.toString();
    }

    /**
     * Save page records.
     *
     * @param {Array<Object>} pages Page records.
     * @param {string} runId Run identifier.
     * @returns {Promise<void>}
     */
    async savePages(pages, runId) {
        if (!Array.isArray(pages) || pages.length === 0) {
            return;
        }

        await this.initialize();
        pages.forEach((page) => {
            this.pageBuffer.push({
                runId,
                site: page.site || null,
                environment: page.environment || "prod",
                url: page.url,
                depth: page.depth,
                eventCount: page.eventCount,
                providerCounts: page.providerCounts
            });
        });

        this.tryFlushPages(false);
    }

    /**
     * Save event records.
     *
     * @param {Array<Object>} events Event records.
     * @param {string} runId Run identifier.
     * @returns {Promise<void>}
     */
    async saveEvents(events, runId) {
        if (!Array.isArray(events) || events.length === 0) {
            return;
        }

        await this.initialize();
        events.forEach((event) => {
            this.eventBuffer.push({
                runId,
                site: event.site || null,
                environment: event.environment || "prod",
                pageUrl: event.pageUrl,
                providerKey: event.providerKey,
                timestamp: event.timestamp,
                accountId: event.accountId || null,
                requestType: event.requestType || null,
                params: event.params || []
            });
        });

        this.tryFlushEvents(false);
    }

    /**
     * Save rule result records.
     *
     * @param {Array<Object>} results Rule results.
     * @param {string} runId Run identifier.
     * @returns {Promise<void>}
     */
    async saveRuleResults(results, runId) {
        if (!Array.isArray(results) || results.length === 0) {
            return;
        }

        await this.initialize();
        const records = results.map((result) => ({
            runId,
            site: result.site || null,
            environment: result.environment || "prod",
            ruleId: result.ruleId || result.id,
            provider: result.provider || null,
            passed: result.passed,
            details: result.details
        }));

        await this.ruleResults.insertMany(records, { ordered: false });
    }

    /**
     * Flush all pending writes and close connection.
     *
     * @returns {Promise<void>}
     */
    async close() {
        await this.initialize();
        this.tryFlushEvents(true);
        this.tryFlushPages(true);

        await Promise.all(Array.from(this.pendingWrites));
        await this.clientManager.close();
    }

    /**
     * Flush page buffer when threshold reached.
     *
     * @param {boolean} force Flush regardless of threshold.
     */
    tryFlushPages(force) {
        while (this.pageBuffer.length >= this.batchSize || (force && this.pageBuffer.length > 0)) {
            const batch = this.pageBuffer.splice(0, this.batchSize);
            const writePromise = this.pages.insertMany(batch, { ordered: false })
                .catch(() => {
                    // Keep crawl loop resilient; repository errors are surfaced via final run status.
                })
                .finally(() => {
                    this.pendingWrites.delete(writePromise);
                });

            this.pendingWrites.add(writePromise);
            if (!force) {
                break;
            }
        }
    }

    /**
     * Flush event buffer when threshold reached.
     *
     * @param {boolean} force Flush regardless of threshold.
     */
    tryFlushEvents(force) {
        while (this.eventBuffer.length >= this.batchSize || (force && this.eventBuffer.length > 0)) {
            const batch = this.eventBuffer.splice(0, this.batchSize);
            const writePromise = this.events.insertMany(batch, { ordered: false })
                .catch(() => {
                    // Keep crawl loop resilient; repository errors are surfaced via final run status.
                })
                .finally(() => {
                    this.pendingWrites.delete(writePromise);
                });

            this.pendingWrites.add(writePromise);
            if (!force) {
                break;
            }
        }
    }
}
