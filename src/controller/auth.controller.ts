import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.js";
import { formatValidationErrors } from "../utils/format.js";
import { signupSchema, signinSchema } from "../validations/auth.validation.js";
import { createUser, signInUser } from "../services/auth.service.js";
import { generateToken } from "../utils/jwt.js";
import { cookies } from "../utils/cookies.js";

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedResult = signupSchema.safeParse(req.body);

    if (!validatedResult || !validatedResult.success) {
      return res.status(400).json({
        message: "Invalid signup data",
        details: formatValidationErrors(validatedResult),
      });
    }

    const { email, name, role } = validatedResult.data;

    const user = await createUser(
      validatedResult.data.email,
      validatedResult.data.name,
      validatedResult.data.password,
      validatedResult.data.role
    );

    if (!user) {
      throw new Error("User creation failed");
    }

    const token = generateToken({
      id: user?.id,
      email: user?.email,
      role: user?.role,
    });
    cookies.setCookie(res, "auth_token", token);

    logger.info("Signup data validated:", { email, name, role });

    res
      .status(201)
      .json({ data: user, message: "User signed up successfully" });
  } catch (error) {
    next(error);
  }
}
export async function signin(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedResult = signinSchema.safeParse(req.body);

    if (!validatedResult || !validatedResult.success) {
      return res.status(400).json({
        message: "Invalid signin data",
        details: formatValidationErrors(validatedResult),
      });
    }

    const { email, password } = validatedResult.data;

    const user = await signInUser(email, password);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    cookies.setCookie(res, "auth_token", token);

    logger.info("User signed in:", { email });

    res
      .status(200)
      .json({ data: user, message: "User signed in successfully" });
  } catch (error) {
    next(error);
  }
}

export function signout(req: Request, res: Response, next: NextFunction) {
  try {
    cookies.clearCookie(res, "auth_token");

    logger.info("User signed out");

    res.status(200).json({ message: "User signed out successfully" });
  } catch (error) {
    next(error);
  }
}
