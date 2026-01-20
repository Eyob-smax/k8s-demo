import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import type { Request, Response } from "express";
import { cookies } from "./cookies.js";

describe("cookies utilities", () => {
  let mockRes: Partial<Response>;
  let mockReq: Partial<Request>;

  beforeEach(() => {
    mockRes = {
      setHeader: jest.fn() as unknown as Response["setHeader"],
    };
    mockReq = {
      cookies: {},
    };
  });

  describe("setCookie", () => {
    test("should set cookie with default options", () => {
      cookies.setCookie(mockRes as Response, "test_cookie", "test_value");

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("test_cookie=test_value")
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("httpOnly")
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("sameSite=lax")
      );
    });

    test("should include maxAge in cookie", () => {
      cookies.setCookie(mockRes as Response, "test_cookie", "test_value");

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("maxAge=")
      );
    });

    test("should allow custom options override", () => {
      cookies.setCookie(mockRes as Response, "test_cookie", "test_value", {
        maxAge: 1000,
      });

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("maxAge=1000")
      );
    });
  });

  describe("getCookie", () => {
    test("should return cookie value if exists", () => {
      mockReq.cookies = { test_cookie: "test_value" };

      const result = cookies.getCookie(mockReq as Request, "test_cookie");

      expect(result).toBe("test_value");
    });

    test("should return undefined if cookie does not exist", () => {
      mockReq.cookies = {};

      const result = cookies.getCookie(mockReq as Request, "nonexistent");

      expect(result).toBeUndefined();
    });

    test("should return undefined if cookies object is undefined", () => {
      delete mockReq.cookies;

      const result = cookies.getCookie(mockReq as Request, "test_cookie");

      expect(result).toBeUndefined();
    });
  });

  describe("clearCookie", () => {
    test("should set cookie with maxAge 0 to clear it", () => {
      cookies.clearCookie(mockRes as Response, "test_cookie");

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("test_cookie=;")
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("maxAge=0")
      );
    });

    test("should maintain httpOnly and sameSite when clearing", () => {
      cookies.clearCookie(mockRes as Response, "test_cookie");

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("httpOnly")
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("sameSite=lax")
      );
    });
  });

  describe("getOptions", () => {
    test("should return default options", () => {
      const opts = cookies.getOptions();

      expect(opts.httpOnly).toBe(true);
      expect(opts.sameSite).toBe("lax");
      expect(opts.maxAge).toBe(24 * 60 * 60 * 1000);
    });

    test("should merge overrides with defaults", () => {
      const opts = cookies.getOptions({ maxAge: 5000, custom: "value" });

      expect(opts.httpOnly).toBe(true);
      expect(opts.maxAge).toBe(5000);
      expect((opts as Record<string, unknown>).custom).toBe("value");
    });
  });
});
