import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { logger } from "./config/logger.js";
import cors from "cors";
import cookieParser from "cookie-parser";
export const app = express();

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

// cluster-example.js

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(
  morgan("combined", {
    stream: {
      write: message => logger.log("info", message.trim()),
    },
  })
);

app.get("/", (req, res) => {
  logger.info("Health check endpoint called");
  res.status(200).send("Hello, from acquisitions api!");
});

app.get("/health", (req, res) => {
  logger.info("Health check endpoint called");
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/api", (req, res) => {
  logger.info("API root endpoint called");
  res.status(200).json({
    message: "Welcome to the Acquisitions API",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
