import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.js";
import { formatValidationErrors } from "../utils/format.js";
import { signupSchema } from "../validations/auth.validation.js";

export function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedResult = signupSchema.safeParse(req.body);

    if (!validatedResult || !validatedResult.success) {
      return res.status(400).json({
        message: "Invalid signup data",
        details: formatValidationErrors(validatedResult.error),
      });
    }

    const { email, name, role } = validatedResult.data;

    logger.info("Signup data validated:", { email, name, role });

    res.status(201).json({ message: "User signed up successfully" });
  } catch (error) {
    logger.error("signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export function signin(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json({ message: "User signed in successfully" });
  } catch (error) {
    logger.error("signin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export function signout(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json({ message: "User signed out successfully" });
  } catch (error) {
    logger.error("signout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export function sum(x: number, y: number): number {
  return x + y;
}
