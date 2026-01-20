import express from "express";
import {
  getUsers,
  getUser,
  updateUserHandler,
  deleteUserHandler,
} from "../controller/user.controller.js";

const router = express.Router();

// GET /users - Get all users
router.get("/", getUsers);

// GET /users/:id - Get user by ID
router.get("/:id", getUser);

// PUT /users/:id - Update user by ID
router.put("/:id", updateUserHandler);

// DELETE /users/:id - Delete user by ID
router.delete("/:id", deleteUserHandler);

export default router;
