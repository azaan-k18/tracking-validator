/**
 * Persistence abstraction for tracking audit reporting.
 *
 * @class
 */
export class ReportRepository {
    /**
     * Persist run metadata.
     *
     * @param {Object} meta Run metadata.
     * @returns {Promise<string>}
     */
    async saveRun(meta) {
        void meta;
        throw new Error("saveRun() must be implemented by subclass");
    }

    /**
     * Persist page records.
     *
     * @param {Array<Object>} pages Page records.
     * @param {string} runId Run identifier.
     * @returns {Promise<void>}
     */
    async savePages(pages, runId) {
        void pages;
        void runId;
        throw new Error("savePages() must be implemented by subclass");
    }

    /**
     * Persist event records.
     *
     * @param {Array<Object>} events Event records.
     * @param {string} runId Run identifier.
     * @returns {Promise<void>}
     */
    async saveEvents(events, runId) {
        void events;
        void runId;
        throw new Error("saveEvents() must be implemented by subclass");
    }

    /**
     * Persist rule result records.
     *
     * @param {Array<Object>} results Rule results.
     * @param {string} runId Run identifier.
     * @returns {Promise<void>}
     */
    async saveRuleResults(results, runId) {
        void results;
        void runId;
        throw new Error("saveRuleResults() must be implemented by subclass");
    }

    /**
     * Close and flush repository resources.
     *
     * @returns {Promise<Object|undefined>}
     */
    async close() {
        return undefined;
    }
}
