import { app, logger } from "@/server";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";
const NODE_ENV = process.env.NODE_ENV || "development";

const server = app.listen(PORT, () => {
  logger.info(`Server (${NODE_ENV}) running on http://${HOST}:${PORT}`);
});

const onCloseSignal = () => {
  logger.info("SIGINT received, shutting down");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
  setTimeout(() => {
    logger.warn("Forcing shutdown after 10 seconds");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
