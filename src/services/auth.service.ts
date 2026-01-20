import { db } from "../config/db.js";
import { users } from "../models/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { logger } from "../config/logger.js";

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hashed = await bcrypt.hash(password, 12);
    return hashed;
  } catch (error) {
    logger.error("Error hashing password:", error);
    throw new Error("Password hashing failed");
  }
};

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    logger.error("Error comparing passwords:", error);
    throw new Error("Password comparison failed");
  }
};

export const signInUser = async (email: string, password: string) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return null;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return null;
    }

    logger.info("User signed in successfully:", { email });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch (error) {
    logger.error("Error signing in user:", error);
    throw new Error("Sign in failed");
  }
};

export const createUser = async (
  email: string,
  name: string,
  password: string,
  role?: string
) => {
  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        password: hashedPassword,
        role: role || "user",
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.created_at,
      });

    logger.info("User created successfully:", { email, name, role });

    return newUser;
  } catch (error) {
    logger.error("Error creating user:", error);
    throw new Error("User creation failed");
  }
};
