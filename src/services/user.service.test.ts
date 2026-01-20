/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, test, expect, beforeEach } from "@jest/globals";

// Mock dependencies
jest.unstable_mockModule("../config/db.js", () => ({
  db: {
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.unstable_mockModule("../config/logger.js", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.unstable_mockModule("./auth.service.js", () => ({
  hashPassword: jest.fn(),
}));

const { db } = await import("../config/db.js");
const { hashPassword } = await import("./auth.service.js");
const { getAllUsers, getUserById, getUserByEmail, updateUser, deleteUser } =
  await import("./user.service.js");

// Type the mocked db methods
const mockDbSelect = db.select as jest.Mock<any>;
const mockDbUpdate = db.update as jest.Mock<any>;
const mockDbDelete = db.delete as jest.Mock<any>;
const mockHashPassword = hashPassword as jest.Mock<any>;

describe("user.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    role: "user",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  describe("getAllUsers", () => {
    test("should return all users", async () => {
      const mockUsers = [
        mockUser,
        { ...mockUser, id: 2, email: "test2@example.com" },
      ];

      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockResolvedValue(mockUsers),
      });
      mockDbSelect.mockImplementation(mockSelect);

      const result = await getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(result.length).toBe(2);
    });

    test("should return empty array when no users exist", async () => {
      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockResolvedValue([]),
      });
      mockDbSelect.mockImplementation(mockSelect);

      const result = await getAllUsers();

      expect(result).toEqual([]);
    });

    test("should throw error on database failure", async () => {
      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockRejectedValue(new Error("DB error")),
      });
      mockDbSelect.mockImplementation(mockSelect);

      await expect(getAllUsers()).rejects.toThrow("Failed to fetch users");
    });
  });

  describe("getUserById", () => {
    test("should return user when found", async () => {
      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            limit: jest.fn<any>().mockResolvedValue([mockUser]),
          }),
        }),
      });
      mockDbSelect.mockImplementation(mockSelect);

      const result = await getUserById(1);

      expect(result).toEqual(mockUser);
    });

    test("should return null when user not found", async () => {
      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            limit: jest.fn<any>().mockResolvedValue([]),
          }),
        }),
      });
      mockDbSelect.mockImplementation(mockSelect);

      const result = await getUserById(999);

      expect(result).toBeNull();
    });

    test("should throw error on database failure", async () => {
      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            limit: jest.fn<any>().mockRejectedValue(new Error("DB error")),
          }),
        }),
      });
      mockDbSelect.mockImplementation(mockSelect);

      await expect(getUserById(1)).rejects.toThrow("Failed to fetch user");
    });
  });

  describe("getUserByEmail", () => {
    test("should return user when found", async () => {
      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            limit: jest.fn<any>().mockResolvedValue([mockUser]),
          }),
        }),
      });
      mockDbSelect.mockImplementation(mockSelect);

      const result = await getUserByEmail("test@example.com");

      expect(result).toEqual(mockUser);
    });

    test("should return null when user not found", async () => {
      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            limit: jest.fn<any>().mockResolvedValue([]),
          }),
        }),
      });
      mockDbSelect.mockImplementation(mockSelect);

      const result = await getUserByEmail("nonexistent@example.com");

      expect(result).toBeNull();
    });
  });

  describe("updateUser", () => {
    test("should update and return user", async () => {
      const updatedUser = { ...mockUser, name: "Updated Name" };

      // Mock for getUserById (check existence)
      const mockSelectForExistence = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            limit: jest.fn<any>().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const mockUpdate = jest.fn<any>().mockReturnValue({
        set: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            returning: jest.fn<any>().mockResolvedValue([updatedUser]),
          }),
        }),
      });

      mockDbSelect.mockImplementation(mockSelectForExistence);
      mockDbUpdate.mockImplementation(mockUpdate);

      const result = await updateUser(1, { name: "Updated Name" });

      expect(result).toEqual(updatedUser);
    });

    test("should return null when user not found", async () => {
      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            limit: jest.fn<any>().mockResolvedValue([]),
          }),
        }),
      });
      mockDbSelect.mockImplementation(mockSelect);

      const result = await updateUser(999, { name: "New Name" });

      expect(result).toBeNull();
    });

    test("should hash password when updating password", async () => {
      const updatedUser = { ...mockUser };

      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            limit: jest.fn<any>().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const mockUpdate = jest.fn<any>().mockReturnValue({
        set: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            returning: jest.fn<any>().mockResolvedValue([updatedUser]),
          }),
        }),
      });

      mockDbSelect.mockImplementation(mockSelect);
      mockDbUpdate.mockImplementation(mockUpdate);
      mockHashPassword.mockResolvedValue("hashed_password");

      await updateUser(1, { password: "newpassword123" });

      expect(hashPassword).toHaveBeenCalledWith("newpassword123");
    });

    test("should throw error when email already in use", async () => {
      const existingUser = {
        ...mockUser,
        id: 2,
        email: "existing@example.com",
      };

      // First call: check user exists (return current user)
      // Second call: check email exists (return another user with that email)
      let callCount = 0;
      const mockSelect = jest.fn<any>().mockImplementation(() => ({
        from: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            limit: jest.fn<any>().mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                return Promise.resolve([mockUser]);
              }
              return Promise.resolve([existingUser]);
            }),
          }),
        }),
      }));

      mockDbSelect.mockImplementation(mockSelect);

      await expect(
        updateUser(1, { email: "existing@example.com" })
      ).rejects.toThrow("Email already in use");
    });
  });

  describe("deleteUser", () => {
    test("should delete user and return true", async () => {
      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            limit: jest.fn<any>().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const mockDelete = jest.fn<any>().mockReturnValue({
        where: jest.fn<any>().mockResolvedValue(undefined),
      });

      mockDbSelect.mockImplementation(mockSelect);
      mockDbDelete.mockImplementation(mockDelete);

      const result = await deleteUser(1);

      expect(result).toBe(true);
    });

    test("should return false when user not found", async () => {
      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            limit: jest.fn<any>().mockResolvedValue([]),
          }),
        }),
      });
      mockDbSelect.mockImplementation(mockSelect);

      const result = await deleteUser(999);

      expect(result).toBe(false);
    });

    test("should throw error on database failure", async () => {
      const mockSelect = jest.fn<any>().mockReturnValue({
        from: jest.fn<any>().mockReturnValue({
          where: jest.fn<any>().mockReturnValue({
            limit: jest.fn<any>().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const mockDelete = jest.fn<any>().mockReturnValue({
        where: jest.fn<any>().mockRejectedValue(new Error("DB error")),
      });

      mockDbSelect.mockImplementation(mockSelect);
      mockDbDelete.mockImplementation(mockDelete);

      await expect(deleteUser(1)).rejects.toThrow("Failed to delete user");
    });
  });
});
