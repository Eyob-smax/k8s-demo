import type { Response, Request } from "express";
export const cookies = {
  setCookie: (
    res: Response,
    name: string,
    value: string,
    options: object = {}
  ) => {
    const opts = cookies.getOptions(options);
    const cookieParts = [`${name}=${value}`];

    for (const [key, val] of Object.entries(opts)) {
      if (val === true) {
        cookieParts.push(key);
      } else if (val !== false) {
        cookieParts.push(`${key}=${val}`);
      }
    }

    res.setHeader("Set-Cookie", cookieParts.join("; "));
  },
  getOptions: (overrides: object = {}) => {
    const defaultOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    };
    return { ...defaultOptions, ...overrides };
  },

  getCookie: (req: Request, name: string): string | undefined => {
    return req.cookies ? req.cookies[name] : undefined;
  },

  clearCookie: (res: Response, name: string, options: object = {}) => {
    const opts = cookies.getOptions({ ...options, maxAge: 0 });
    const cookieParts = [`${name}=;`];

    for (const [key, val] of Object.entries(opts)) {
      if (val === true) {
        cookieParts.push(key);
      } else if (val !== false) {
        cookieParts.push(`${key}=${val}`);
      }
    }

    res.setHeader("Set-Cookie", cookieParts.join("; "));
  },
};
