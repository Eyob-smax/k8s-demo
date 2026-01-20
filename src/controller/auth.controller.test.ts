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

jest.unstable_mockModule("../services/auth.service.js", () => ({
  createUser: jest.fn(),
  signInUser: jest.fn(),
}));

jest.unstable_mockModule("../utils/jwt.js", () => ({
  generateToken: jest.fn(),
}));

jest.unstable_mockModule("../utils/cookies.js", () => ({
  cookies: {
    setCookie: jest.fn(),
    clearCookie: jest.fn(),
  },
}));

const { createUser, signInUser } = await import("../services/auth.service.js");
const { generateToken } = await import("../utils/jwt.js");
const { cookies } = await import("../utils/cookies.js");
const { signup, signin, signout } = await import("./auth.controller.js");

// Type mocks
const mockCreateUser = createUser as jest.Mock<any>;
const mockSignInUser = signInUser as jest.Mock<any>;
const mockGenerateToken = generateToken as jest.Mock<any>;

describe("auth.controller", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis() as unknown as Response["status"],
      json: jest.fn().mockReturnThis() as unknown as Response["json"],
      setHeader: jest.fn() as unknown as Response["setHeader"],
    };

    mockNext = jest.fn() as unknown as NextFunction;
  });

  describe("signup", () => {
    test("should return 400 for invalid signup data", async () => {
      mockReq.body = { email: "invalid", password: "123" };

      await signup(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid signup data",
        })
      );
    });

    test("should create user and return 201 for valid data", async () => {
      const validUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "user",
      };

      const createdUser = {
        id: 1,
        email: validUser.email,
        name: validUser.name,
        role: validUser.role,
        createdAt: new Date(),
      };

      mockReq.body = validUser;
      mockCreateUser.mockResolvedValue(createdUser);
      mockGenerateToken.mockReturnValue("mock-token");

      await signup(mockReq as Request, mockRes as Response, mockNext);

      expect(createUser).toHaveBeenCalledWith(
        validUser.email,
        validUser.name,
        validUser.password,
        validUser.role
      );
      expect(generateToken).toHaveBeenCalled();
      expect(cookies.setCookie).toHaveBeenCalledWith(
        expect.anything(),
        "auth_token",
        "mock-token"
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: createdUser,
        message: "User signed up successfully",
      });
    });

    test("should call next with error when createUser throws", async () => {
      const validUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      mockReq.body = validUser;
      const error = new Error("Database error");
      mockCreateUser.mockRejectedValue(error);

      await signup(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("signin", () => {
    test("should return 400 for invalid signin data", async () => {
      mockReq.body = { email: "invalid" };

      await signin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid signin data",
        })
      );
    });

    test("should return 401 for invalid credentials", async () => {
      mockReq.body = {
        email: "test@example.com",
        password: "wrongpassword",
      };
      mockSignInUser.mockResolvedValue(null);

      await signin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Invalid email or password",
      });
    });

    test("should return 200 and set cookie for valid credentials", async () => {
      const user = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        role: "user",
      };

      mockReq.body = {
        email: "test@example.com",
        password: "password123",
      };
      mockSignInUser.mockResolvedValue(user);
      mockGenerateToken.mockReturnValue("mock-token");

      await signin(mockReq as Request, mockRes as Response, mockNext);

      expect(signInUser).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(generateToken).toHaveBeenCalledWith({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      expect(cookies.setCookie).toHaveBeenCalledWith(
        expect.anything(),
        "auth_token",
        "mock-token"
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: user,
        message: "User signed in successfully",
      });
    });

    test("should call next with error when signInUser throws", async () => {
      mockReq.body = {
        email: "test@example.com",
        password: "password123",
      };
      const error = new Error("Database error");
      mockSignInUser.mockRejectedValue(error);

      await signin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("signout", () => {
    test("should clear cookie and return 200", () => {
      signout(mockReq as Request, mockRes as Response, mockNext);

      expect(cookies.clearCookie).toHaveBeenCalledWith(
        expect.anything(),
        "auth_token"
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User signed out successfully",
      });
    });
  });
});
