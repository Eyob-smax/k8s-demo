import { db } from "../config/db.js";
import { users } from "../models/schema.js";
import { eq } from "drizzle-orm";
import { logger } from "../config/logger.js";
import { hashPassword } from "./auth.service.js";

export type UserResponse = {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export const getAllUsers = async (): Promise<UserResponse[]> => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.created_at,
        updatedAt: users.updated_at,
      })
      .from(users);

    logger.info("Fetched all users", { count: allUsers.length });
    return allUsers;
  } catch (error) {
    logger.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
};

export const getUserById = async (id: number): Promise<UserResponse | null> => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.created_at,
        updatedAt: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return null;
    }

    logger.info("Fetched user by id", { id });
    return user;
  } catch (error) {
    logger.error("Error fetching user by id:", error);
    throw new Error("Failed to fetch user");
  }
};

export const getUserByEmail = async (
  email: string
): Promise<UserResponse | null> => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.created_at,
        updatedAt: users.updated_at,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return null;
    }

    logger.info("Fetched user by email", { email });
    return user;
  } catch (error) {
    logger.error("Error fetching user by email:", error);
    throw new Error("Failed to fetch user");
  }
};

export const updateUser = async (
  id: number,
  data: {
    name?: string | undefined;
    email?: string | undefined;
    role?: string | undefined;
    password?: string | undefined;
  }
): Promise<UserResponse | null> => {
  try {
    // Check if user exists
    const existing = await getUserById(id);
    if (!existing) {
      return null;
    }

    // Check if email is being changed and already exists
    if (data.email && data.email !== existing.email) {
      const emailExists = await getUserByEmail(data.email);
      if (emailExists) {
        throw new Error("Email already in use");
      }
    }

    // Prepare update data
    const updateData: Record<string, string> = {};

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.created_at,
        updatedAt: users.updated_at,
      });

    if (!updatedUser) {
      return null;
    }

    logger.info("User updated successfully", { id });
    return updatedUser;
  } catch (error) {
    logger.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<boolean> => {
  try {
    const existing = await getUserById(id);
    if (!existing) {
      return false;
    }

    await db.delete(users).where(eq(users.id, id));

    logger.info("User deleted successfully", { id });
    return true;
  } catch (error) {
    logger.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
};
