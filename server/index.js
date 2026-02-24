import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

/**
 * Create API server.
 *
 * @returns {Promise<void>}
 */
async function startServer() {
    const app = express();
    app.use(cors());
    app.use(express.json());

    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
    const dbName = process.env.MONGO_DB_NAME || "trackingValidator";
    const client = new MongoClient(mongoUri);

    await client.connect();
    const db = client.db(dbName);

    const runs = db.collection("runs");
    const pages = db.collection("pages");
    const events = db.collection("events");
    const ruleResults = db.collection("ruleResults");

    /**
     * Parse and validate run id.
     *
     * @param {string} id Run identifier.
     * @returns {ObjectId}
     */
    function parseRunId(id) {
        if (!ObjectId.isValid(id)) {
            throw new Error("Invalid run id");
        }
        return new ObjectId(id);
    }

    app.get("/api/runs", async (request, response) => {
        try {
            const limit = Math.min(Number(request.query.limit) || 50, 200);
            const query = {};
            if (typeof request.query.site === "string" && request.query.site.trim().length > 0) {
                query.site = request.query.site.trim();
            }

            const data = await runs.find(query).sort({ startedAt: -1 }).limit(limit).toArray();
            response.json(data);
        } catch (error) {
            response.status(500).json({ error: error.message });
        }
    });

    app.get("/api/runs/:id", async (request, response) => {
        try {
            const id = parseRunId(request.params.id);
            const query = { _id: id };
            if (typeof request.query.site === "string" && request.query.site.trim().length > 0) {
                query.site = request.query.site.trim();
            }

            const run = await runs.findOne(query);
            if (!run) {
                response.status(404).json({ error: "Run not found" });
                return;
            }

            response.json(run);
        } catch (error) {
            response.status(400).json({ error: error.message });
        }
    });

    app.get("/api/runs/:id/pages", async (request, response) => {
        try {
            parseRunId(request.params.id);
            const query = { runId: request.params.id };
            if (typeof request.query.site === "string" && request.query.site.trim().length > 0) {
                query.site = request.query.site.trim();
            }

            const data = await pages.find(query).sort({ depth: 1, url: 1 }).toArray();
            response.json(data);
        } catch (error) {
            response.status(400).json({ error: error.message });
        }
    });

    app.get("/api/runs/:id/events", async (request, response) => {
        try {
            parseRunId(request.params.id);
            const limit = Math.min(Number(request.query.limit) || 2000, 10000);
            const query = { runId: request.params.id };
            if (typeof request.query.site === "string" && request.query.site.trim().length > 0) {
                query.site = request.query.site.trim();
            }

            const data = await events.find(query).sort({ timestamp: 1 }).limit(limit).toArray();
            response.json(data);
        } catch (error) {
            response.status(400).json({ error: error.message });
        }
    });

    app.get("/api/runs/:id/rules", async (request, response) => {
        try {
            parseRunId(request.params.id);
            const query = { runId: request.params.id };
            if (typeof request.query.site === "string" && request.query.site.trim().length > 0) {
                query.site = request.query.site.trim();
            }

            const data = await ruleResults.find(query).toArray();
            response.json(data);
        } catch (error) {
            response.status(400).json({ error: error.message });
        }
    });

    const port = Number(process.env.PORT || 4000);
    app.listen(port, () => {
        console.log(`Tracking Validator API listening at http://localhost:${port}`);
    });
}

startServer().catch((error) => {
    console.error("Failed to start API server", error);
    process.exit(1);
});
