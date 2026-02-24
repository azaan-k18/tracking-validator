import { MongoClient } from "mongodb";

/**
 * Mongo client singleton manager.
 *
 * @class
 */
export class MongoClientManager {
    /**
     * Create client manager.
     *
     * @param {string} uri MongoDB connection string.
     * @param {string} dbName Database name.
     */
    constructor(uri, dbName) {
        this.uri = uri;
        this.dbName = dbName;
        this.client = null;
        this.db = null;
        this.connectPromise = null;
    }

    /**
     * Connect to MongoDB.
     *
     * @returns {Promise<import("mongodb").Db>}
     */
    async connect() {
        if (this.db) {
            return this.db;
        }

        if (!this.connectPromise) {
            this.connectPromise = (async () => {
                this.client = new MongoClient(this.uri);
                await this.client.connect();
                this.db = this.client.db(this.dbName);
                return this.db;
            })();
        }

        return this.connectPromise;
    }

    /**
     * Close MongoDB connection.
     *
     * @returns {Promise<void>}
     */
    async close() {
        if (this.client) {
            await this.client.close();
        }

        this.client = null;
        this.db = null;
        this.connectPromise = null;
    }
}
