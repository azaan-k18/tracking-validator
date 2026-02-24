import { FileReportRepository } from "./FileReportRepository.js";

/**
 * Build repository instance from configuration.
 *
 * @param {Object} persistence Persistence config.
 * @param {Object} output Output config.
 * @returns {Promise<import("./ReportRepository.js").ReportRepository>}
 */
export async function createReportRepository(persistence = {}, output = {}) {
    const type = String(persistence?.type || "file").toLowerCase();

    if (type === "mongo") {
        const module = await import("./MongoReportRepository.js");
        return new module.MongoReportRepository({
            uri: persistence.uri,
            dbName: persistence.dbName,
            batchSize: persistence.batchSize
        });
    }

    return new FileReportRepository({
        outputDir: output.directory
    });
}
