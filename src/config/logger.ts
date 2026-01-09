import wiston from "winston";
import "dotenv/config";

export const logger = wiston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: wiston.format.combine(
    wiston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    wiston.format.errors({ stack: true }),
    wiston.format.splat(),
    wiston.format.json()
  ),
  defaultMeta: { service: "user-service" },
  transports: [
    new wiston.transports.File({ filename: "./log/error.log", level: "error" }),
    new wiston.transports.File({ filename: "./log/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new wiston.transports.Console({
      format: wiston.format.combine(
        wiston.format.colorize(),
        wiston.format.simple()
      ),
    })
  );
}
