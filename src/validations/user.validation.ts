import { z } from "zod";

export const updateUserSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email format").optional(),
    role: z.enum(["user", "admin"]).optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });
