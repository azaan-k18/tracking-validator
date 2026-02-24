import nodemailer from "nodemailer";

/**
 * Email alert service for rule failures.
 *
 * @class
 */
export class EmailAlertService {
    /**
     * Create email alert service.
     *
     * @param {{host?: string, port?: string|number, user?: string, pass?: string, from?: string, to?: string}} config SMTP config.
     */
    constructor(config = {}) {
        this.config = {
            host: config.host || "",
            port: Number(config.port || 0),
            user: config.user || "",
            pass: config.pass || "",
            from: config.from || "",
            to: config.to || ""
        };
    }

    /**
     * Send failure alert email.
     *
     * @param {{site?: string, website: string, failures: Array<{provider: string, details: string}>}} payload Alert payload.
     * @returns {Promise<void>}
     */
    async sendFailureAlert({ site, website, failures }) {
        if (!Array.isArray(failures) || failures.length === 0) {
            return;
        }

        if (!this.hasValidConfig()) {
            console.warn("Email alert skipped: missing SMTP environment variables.");
            return;
        }

        const transporter = nodemailer.createTransport({
            host: this.config.host,
            port: this.config.port,
            secure: this.config.port === 465,
            auth: {
                user: this.config.user,
                pass: this.config.pass
            }
        });

        const subject = `Tracking Failure Alert - ${site || "unknown"} - ${website}`;
        const lines = failures.map((failure, index) => {
            const provider = String(failure?.provider || "UNKNOWN");
            const details = String(failure?.details || "Unknown failure.");
            return `${index + 1}. ${provider} - ${details}`;
        });
        const text = `Failure in Metric tracking for '${website}'.\n\nThe following tracking validations failed:\n\n${lines.join("\n")}`;

        try {
            await transporter.sendMail({
                from: this.config.from,
                to: this.config.to,
                subject,
                text
            });
        } catch (error) {
            console.error("Failed to send email alert", error);
        }
    }

    /**
     * Check whether SMTP config is complete.
     *
     * @returns {boolean}
     */
    hasValidConfig() {
        return Boolean(
            this.config.host
            && this.config.port
            && this.config.user
            && this.config.pass
            && this.config.from
            && this.config.to
        );
    }
}
