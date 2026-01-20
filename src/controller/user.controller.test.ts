/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";

// Mock dependencies
jest.unstable_mockModule("../config/logger.js", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.unstable_mockModule("../services/user.service.js", () => ({
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

const { getAllUsers, getUserById, updateUser, deleteUser } =
  await import("../services/user.service.js");
const { getUsers, getUser, updateUserHandler, deleteUserHandler } =
  await import("./user.controller.js");

// Type mocks
const mockGetAllUsers = getAllUsers as jest.Mock<any>;
const mockGetUserById = getUserById as jest.Mock<any>;
const mockUpdateUser = updateUser as jest.Mock<any>;
const mockDeleteUser = deleteUser as jest.Mock<any>;

describe("user.controller", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
      params: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis() as unknown as Response["status"],
      json: jest.fn().mockReturnThis() as unknown as Response["json"],
    };

    mockNext = jest.fn() as unknown as NextFunction;
  });

  const mockUser = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    role: "user",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  describe("getUsers", () => {
    test("should return 200 with all users", async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 2 }];
      mockGetAllUsers.mockResolvedValue(mockUsers);

      await getUsers(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: mockUsers,
        message: "Users fetched successfully",
      });
    });

    test("should return 200 with empty array when no users", async () => {
      mockGetAllUsers.mockResolvedValue([]);

      await getUsers(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: [],
        message: "Users fetched successfully",
      });
    });

    test("should call next with error on failure", async () => {
      const error = new Error("Database error");
      mockGetAllUsers.mockRejectedValue(error);

      await getUsers(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getUser", () => {
    test("should return 200 with user when found", async () => {
      mockReq.params = { id: "1" };
      mockGetUserById.mockResolvedValue(mockUser);

      await getUser(mockReq as Request, mockRes as Response, mockNext);

      expect(getUserById).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: mockUser,
        message: "User fetched successfully",
      });
    });

    test("should return 400 for invalid user ID", async () => {
      mockReq.params = { id: "invalid" };

      await getUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Invalid user ID",
      });
    });

    test("should return 404 when user not found", async () => {
      mockReq.params = { id: "999" };
      mockGetUserById.mockResolvedValue(null);

      await getUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });

    test("should call next with error on failure", async () => {
      mockReq.params = { id: "1" };
      const error = new Error("Database error");
      mockGetUserById.mockRejectedValue(error);

      await getUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("updateUserHandler", () => {
    test("should return 200 with updated user", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = { name: "Updated Name" };
      const updatedUser = { ...mockUser, name: "Updated Name" };
      mockUpdateUser.mockResolvedValue(updatedUser);

      await updateUserHandler(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(updateUser).toHaveBeenCalledWith(1, {
        name: "Updated Name",
        email: undefined,
        role: undefined,
        password: undefined,
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: updatedUser,
        message: "User updated successfully",
      });
    });

    test("should return 400 for invalid user ID", async () => {
      mockReq.params = { id: "invalid" };
      mockReq.body = { name: "Test" };

      await updateUserHandler(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Invalid user ID",
      });
    });

    test("should return 400 for invalid update data (empty body)", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = {};

      await updateUserHandler(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid update data",
        })
      );
    });

    test("should return 400 for invalid email format", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = { email: "invalid-email" };

      await updateUserHandler(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid update data",
        })
      );
    });

    test("should return 404 when user not found", async () => {
      mockReq.params = { id: "999" };
      mockReq.body = { name: "Test" };
      mockUpdateUser.mockResolvedValue(null);

      await updateUserHandler(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });

    test("should return 409 when email already in use", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = { email: "existing@example.com" };
      mockUpdateUser.mockRejectedValue(new Error("Email already in use"));

      await updateUserHandler(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Email already in use",
      });
    });

    test("should call next with error on other failures", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = { name: "Test" };
      const error = new Error("Database error");
      mockUpdateUser.mockRejectedValue(error);

      await updateUserHandler(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteUserHandler", () => {
    test("should return 200 when user deleted", async () => {
      mockReq.params = { id: "1" };
      mockDeleteUser.mockResolvedValue(true);

      await deleteUserHandler(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(deleteUser).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User deleted successfully",
      });
    });

    test("should return 400 for invalid user ID", async () => {
      mockReq.params = { id: "invalid" };

      await deleteUserHandler(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Invalid user ID",
      });
    });

    test("should return 404 when user not found", async () => {
      mockReq.params = { id: "999" };
      mockDeleteUser.mockResolvedValue(false);

      await deleteUserHandler(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });

    test("should call next with error on failure", async () => {
      mockReq.params = { id: "1" };
      const error = new Error("Database error");
      mockDeleteUser.mockRejectedValue(error);

      await deleteUserHandler(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
