import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import { spawn } from "node:child_process";
import "dotenv/config";
import { sites } from "../config/sites.js";
import { ALLOWED_ENVIRONMENTS } from "../config/base.config.js";

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
    const buildJobs = db.collection("buildJobs");
    const runningBuilds = new Set();

    await Promise.all([
        runs.createIndex({ site: 1, environment: 1, startedAt: -1 }),
        buildJobs.createIndex({ domain: 1, environment: 1, startedAt: -1 }),
        buildJobs.createIndex({ status: 1, startedAt: -1 })
    ]);

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

    /**
     * Normalize run status for API clients.
     *
     * @param {string} status Raw run status.
     * @returns {"RUNNING"|"SUCCESS"|"FAILED"}
     */
    function normalizeRunStatus(status) {
        const value = String(status || "").toLowerCase();
        if (value === "running") {
            return "RUNNING";
        }
        if (value === "completed") {
            return "SUCCESS";
        }
        return "FAILED";
    }

    /**
     * Ensure incoming site value is valid.
     *
     * @param {unknown} site Site key.
     * @returns {string}
     */
    function validateSite(site) {
        const normalized = String(site || "").trim();
        if (!normalized || !sites[normalized]) {
            throw new Error("Invalid domain");
        }
        return normalized;
    }

    /**
     * Ensure incoming environment value is valid.
     *
     * @param {unknown} environment Environment key.
     * @returns {string}
     */
    function validateEnvironment(environment) {
        const normalized = String(environment || "prod").trim().toLowerCase();
        if (!ALLOWED_ENVIRONMENTS.includes(normalized)) {
            throw new Error("Invalid environment");
        }
        return normalized;
    }

    /**
     * Append environment filtering with prod backward compatibility.
     *
     * @param {Object} query Mongo query object.
     * @param {unknown} value Environment query value.
     */
    function applyEnvironmentFilter(query, value) {
        if (typeof value !== "string" || value.trim().length === 0) {
            return;
        }

        const environment = value.trim().toLowerCase();
        if (!ALLOWED_ENVIRONMENTS.includes(environment)) {
            return;
        }

        if (environment === "prod") {
            query.$or = [
                { environment: "prod" },
                { environment: { $exists: false } },
                { environment: null }
            ];
            return;
        }

        query.environment = environment;
    }

    /**
     * Append log lines to run with capped history.
     *
     * @param {ObjectId} runObjectId Run identifier.
     * @param {string[]} lines Log lines.
     * @param {"stdout"|"stderr"|"system"} source Log source.
     * @returns {Promise<void>}
     */
    async function appendRunLogs(runObjectId, lines, source = "system") {
        const entries = (Array.isArray(lines) ? lines : [])
            .map((line) => String(line || "").trim())
            .filter((line) => line.length > 0)
            .map((message) => ({
                timestamp: new Date(),
                message,
                source,
                isError: source === "stderr"
            }));

        if (entries.length === 0) {
            return;
        }

        await runs.updateOne(
            { _id: runObjectId },
            {
                $push: {
                    logs: {
                        $each: entries,
                        $slice: -5000
                    }
                }
            }
        );
    }

    /**
     * Check whether caller is from local/private network.
     *
     * @param {import("express").Request} request Request.
     * @returns {boolean}
     */
    function isInternalRequest(request) {
        const forwarded = String(request.headers["x-forwarded-for"] || "").split(",")[0].trim();
        const candidate = forwarded || request.ip || "";
        const ip = candidate.replace("::ffff:", "");
        if (ip === "127.0.0.1" || ip === "::1") {
            return true;
        }
        if (/^10\./.test(ip)) {
            return true;
        }
        if (/^192\.168\./.test(ip)) {
            return true;
        }
        if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) {
            return true;
        }
        return false;
    }

    app.get("/api/runs", async (request, response) => {
        try {
            const limit = Math.min(Number(request.query.limit) || 50, 200);
            const query = {};
            if (typeof request.query.site === "string" && request.query.site.trim().length > 0) {
                query.site = request.query.site.trim();
            }
            applyEnvironmentFilter(query, request.query.environment);

            const data = await runs.find(query, { projection: { logs: 0 } }).sort({ startedAt: -1 }).limit(limit).toArray();
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
            applyEnvironmentFilter(query, request.query.environment);

            const run = await runs.findOne(query, { projection: { logs: 0 } });
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
            applyEnvironmentFilter(query, request.query.environment);

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
            applyEnvironmentFilter(query, request.query.environment);

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
            applyEnvironmentFilter(query, request.query.environment);

            const data = await ruleResults.find(query).toArray();
            response.json(data);
        } catch (error) {
            response.status(400).json({ error: error.message });
        }
    });

    app.get("/api/runs/:id/logs", async (request, response) => {
        try {
            const id = parseRunId(request.params.id);
            const query = { _id: id };
            if (typeof request.query.site === "string" && request.query.site.trim().length > 0) {
                query.site = request.query.site.trim();
            }
            applyEnvironmentFilter(query, request.query.environment);

            let run = await runs.findOne(query, { projection: { logs: 1, status: 1 } });
            if (!run) {
                run = await runs.findOne({ _id: id }, { projection: { logs: 1, status: 1 } });
            }
            if (!run) {
                response.status(404).json({ error: "Run not found" });
                return;
            }

            const limit = Math.min(Math.max(Number(request.query.limit) || 500, 1), 5000);
            const logs = Array.isArray(run.logs) ? run.logs.slice(-limit) : [];
            response.json({
                logs,
                status: normalizeRunStatus(run.status)
            });
        } catch (error) {
            response.status(400).json({ error: error.message });
        }
    });

    app.post("/api/build", async (request, response) => {
        try {
            const internalOnly = String(process.env.BUILD_API_INTERNAL_ONLY || "true").toLowerCase() !== "false";
            if (internalOnly && !isInternalRequest(request)) {
                response.status(403).json({ error: "Forbidden" });
                return;
            }

            const domain = validateSite(request.body?.domain);
            const environment = validateEnvironment(request.body?.environment);
            const lockKey = `${domain}:${environment}`;

            if (runningBuilds.has(lockKey)) {
                response.status(409).json({ error: "Build already running for this domain/environment" });
                return;
            }

            runningBuilds.add(lockKey);
            const now = new Date().toISOString();
            const runInsert = await runs.insertOne({
                site: domain,
                environment,
                startedAt: now,
                finishedAt: null,
                startUrl: sites[domain]?.environments?.[environment]?.startUrl || sites[domain]?.environments?.prod?.startUrl || sites[domain]?.startUrl || null,
                pagesCrawled: 0,
                eventsCaptured: 0,
                rulesPassed: 0,
                rulesFailed: 0,
                status: "running",
                logs: []
            });
            const runId = runInsert.insertedId.toString();
            const runObjectId = runInsert.insertedId;

            const job = await buildJobs.insertOne({
                runId,
                domain,
                environment,
                status: "RUNNING",
                startedAt: now,
                finishedAt: null,
                stdout: "",
                stderr: ""
            });

            const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
            const child = spawn(npmCmd, ["run", "validate", "--", "--site", domain, "--env", environment, "--run-id", runId], {
                cwd: process.cwd(),
                env: process.env,
                stdio: ["ignore", "pipe", "pipe"]
            });

            let stdout = "";
            let stderr = "";
            let stdoutRemainder = "";
            let stderrRemainder = "";
            let logQueue = Promise.resolve();
            const queueLogAppend = (lines, source) => {
                logQueue = logQueue
                    .then(() => appendRunLogs(runObjectId, lines, source))
                    .catch((error) => {
                        console.error("Failed to append run logs", error);
                    });
                return logQueue;
            };

            await queueLogAppend([`Build started for ${domain}/${environment}`], "system");

            child.stdout.on("data", (chunk) => {
                const text = chunk.toString();
                stdout = `${stdout}${text}`;
                const combined = `${stdoutRemainder}${text}`;
                const lines = combined.split(/\r?\n/);
                stdoutRemainder = lines.pop() || "";
                queueLogAppend(lines, "stdout");
            });

            child.stderr.on("data", (chunk) => {
                const text = chunk.toString();
                stderr = `${stderr}${text}`;
                const combined = `${stderrRemainder}${text}`;
                const lines = combined.split(/\r?\n/);
                stderrRemainder = lines.pop() || "";
                queueLogAppend(lines, "stderr");
            });

            child.on("close", async (code) => {
                const finishedAt = new Date().toISOString();
                const status = code === 0 ? "SUCCESS" : "FAILED";
                runningBuilds.delete(lockKey);
                try {
                    await queueLogAppend([stdoutRemainder], "stdout");
                    await queueLogAppend([stderrRemainder], "stderr");
                    await queueLogAppend([`Build finished with exit code ${code ?? -1}`], "system");
                    await logQueue;
                    await runs.updateOne(
                        { _id: runObjectId },
                        {
                            $set: {
                                status: code === 0 ? "completed" : "failed",
                                finishedAt
                            }
                        }
                    );
                    await buildJobs.updateOne(
                        { _id: job.insertedId },
                        {
                            $set: {
                                status,
                                finishedAt,
                                stdout: stdout.slice(-200000),
                                stderr: stderr.slice(-200000)
                            }
                        }
                    );
                } catch (updateError) {
                    console.error("Failed to update build job status", updateError);
                }
            });

            child.on("error", async (error) => {
                const finishedAt = new Date().toISOString();
                runningBuilds.delete(lockKey);
                try {
                    await queueLogAppend([`Build process error: ${error.message}`], "stderr");
                    await logQueue;
                    await runs.updateOne(
                        { _id: runObjectId },
                        {
                            $set: {
                                status: "failed",
                                finishedAt
                            }
                        }
                    );
                    await buildJobs.updateOne(
                        { _id: job.insertedId },
                        {
                            $set: {
                                status: "FAILED",
                                finishedAt,
                                stderr: `${stderr}\n${error.message}`.trim()
                            }
                        }
                    );
                } catch (updateError) {
                    console.error("Failed to update build job error state", updateError);
                }
            });

            response.json({ status: "started" });
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
