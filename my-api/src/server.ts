import app from "./app";
import { env } from "./config/env";
import { createLogger } from "@devsaini2300/backend-core";
import { prisma } from "./config/database";

const logger = createLogger({ level: env.LOG_LEVEL });

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  logger.info(`📋 Health check: http://localhost:${env.PORT}/api/health`);
  logger.info(`🔐 Auth API: http://localhost:${env.PORT}/api/auth`);
});

// ── Graceful Shutdown ────────────────────────────────────────
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      await prisma.$disconnect();
      logger.info("Database connection closed");
    } catch (error) {
      logger.error({ err: error }, "Error closing database connection");
    }

    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 30_000);
};

process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => void gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled rejection");
  process.exit(1);
});
