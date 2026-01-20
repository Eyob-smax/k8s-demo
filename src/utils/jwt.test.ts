import { describe, test, expect } from "@jest/globals";
import jwt from "jsonwebtoken";
import { generateToken, verifyToken } from "./jwt.js";

describe("jwt utilities", () => {
  const testPayload = {
    id: 1,
    email: "test@example.com",
    role: "user",
  };

  describe("generateToken", () => {
    test("should generate a valid JWT token", () => {
      const token = generateToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    test("should include payload data in token", () => {
      const token = generateToken(testPayload);
      const decoded = jwt.decode(token) as {
        id: number;
        email: string;
        role: string;
      };

      expect(decoded.id).toBe(testPayload.id);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
    });

    test("should include expiration in token", () => {
      const token = generateToken(testPayload);
      const decoded = jwt.decode(token) as { exp: number };

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe("verifyToken", () => {
    test("should verify and return payload for valid token", () => {
      const token = generateToken(testPayload);
      const result = verifyToken(token) as {
        id: number;
        email: string;
        role: string;
      };

      expect(result.id).toBe(testPayload.id);
      expect(result.email).toBe(testPayload.email);
      expect(result.role).toBe(testPayload.role);
    });

    test("should throw error for invalid token", () => {
      const invalidToken = "invalid.token.here";

      expect(() => verifyToken(invalidToken)).toThrow("Invalid token");
    });

    test("should throw error for tampered token", () => {
      const token = generateToken(testPayload);
      const tamperedToken = token.slice(0, -5) + "xxxxx";

      expect(() => verifyToken(tamperedToken)).toThrow("Invalid token");
    });

    test("should throw error for expired token", () => {
      // Create a token that's already expired
      const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";
      const expiredToken = jwt.sign(testPayload, SECRET_KEY, {
        expiresIn: "-1s",
      });

      expect(() => verifyToken(expiredToken)).toThrow("Invalid token");
    });
  });
});
