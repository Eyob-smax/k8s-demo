import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.js";
import { formatValidationErrors } from "../utils/format.js";
import { updateUserSchema } from "../validations/user.validation.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../services/user.service.js";

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await getAllUsers();

    res.status(200).json({
      data: users,
      message: "Users fetched successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id ?? "", 10);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      data: user,
      message: "User fetched successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id ?? "", 10);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const validatedResult = updateUserSchema.safeParse(req.body);

    if (!validatedResult || !validatedResult.success) {
      return res.status(400).json({
        message: "Invalid update data",
        details: formatValidationErrors(validatedResult),
      });
    }

    const { name, email, role, password } = validatedResult.data;
    const user = await updateUser(id, { name, email, role, password });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    logger.info("User updated:", { id });

    res.status(200).json({
      data: user,
      message: "User updated successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Email already in use") {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
}

export async function deleteUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseInt(req.params.id ?? "", 10);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const deleted = await deleteUser(id);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    logger.info("User deleted:", { id });

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
