/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import bcrypt from "bcrypt";

// Mock dependencies
jest.unstable_mockModule("../config/db.js", () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

jest.unstable_mockModule("../config/logger.js", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const { db } = await import("../config/db.js");
const { hashPassword, comparePassword, signInUser, createUser } =
  await import("./auth.service.js");

// Type the mocked db methods
const mockDbSelect = db.select as jest.Mock<any>;
const mockDbInsert = db.insert as jest.Mock<any>;

describe("auth.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("hashPassword", () => {
    test("should return a hashed password", async () => {
      const password = "testPassword123";
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(typeof hashed).toBe("string");
    });

    test("should produce different hashes for same password", async () => {
      const password = "testPassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("comparePassword", () => {
    test("should return true for matching password", async () => {
      const password = "testPassword123";
      const hashed = await bcrypt.hash(password, 12);

      const result = await comparePassword(password, hashed);

      expect(result).toBe(true);
    });

    test("should return false for non-matching password", async () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword";
      const hashed = await bcrypt.hash(password, 12);

      const result = await comparePassword(wrongPassword, hashed);

      expect(result).toBe(false);
    });
  });

  describe("signInUser", () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      name: "Test User",
      role: "user",
      password: "",
    };

    beforeEach(async () => {
      mockUser.password = await bcrypt.hash("password123", 12);
    });

    test("should return user data for valid credentials", async () => {
      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            limit: jest.fn<any>().mockResolvedValue([mockUser] as any),
          }),
        }),
      });
      mockDbSelect.mockImplementation(mockSelect);

      const result = await signInUser("test@example.com", "password123");

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      });
    });

    test("should return null for non-existent user", async () => {
      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            limit: jest.fn<any>().mockResolvedValue([] as any),
          }),
        }),
      });
      mockDbSelect.mockImplementation(mockSelect);

      const result = await signInUser("nonexistent@example.com", "password123");

      expect(result).toBeNull();
    });

    test("should return null for wrong password", async () => {
      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            limit: jest.fn<any>().mockResolvedValue([mockUser] as any),
          }),
        }),
      });
      mockDbSelect.mockImplementation(mockSelect);

      const result = await signInUser("test@example.com", "wrongpassword");

      expect(result).toBeNull();
    });
  });

  describe("createUser", () => {
    const newUserData = {
      email: "new@example.com",
      name: "New User",
      password: "password123",
      role: "user",
    };

    test("should create and return new user", async () => {
      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            limit: jest.fn<any>().mockResolvedValue([] as any),
          }),
        }),
      });

      const createdUser = {
        id: 1,
        email: newUserData.email,
        name: newUserData.name,
        role: newUserData.role,
        createdAt: new Date().toISOString(),
      };

      const mockInsert = jest.fn<any>().mockReturnValue({
        values: jest.fn<any>().mockReturnValue({
          returning: jest.fn<any>().mockResolvedValue([createdUser] as any),
        }),
      });

      mockDbSelect.mockImplementation(mockSelect);
      mockDbInsert.mockImplementation(mockInsert);

      const result = await createUser(
        newUserData.email,
        newUserData.name,
        newUserData.password,
        newUserData.role
      );

      expect(result).toEqual(createdUser);
    });

    test("should throw error if user already exists", async () => {
      const existingUser = {
        id: 1,
        email: newUserData.email,
        name: "Existing",
        role: "user",
      };

      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            limit: jest.fn<any>().mockResolvedValue([existingUser] as any),
          }),
        }),
      });

      mockDbSelect.mockImplementation(mockSelect);

      await expect(
        createUser(
          newUserData.email,
          newUserData.name,
          newUserData.password,
          newUserData.role
        )
      ).rejects.toThrow("User creation failed");
    });
  });
});
