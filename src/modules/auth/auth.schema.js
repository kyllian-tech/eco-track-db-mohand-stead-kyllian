const { z } = require("zod");

const roles = ["admin", "manager", "collector", "analyst"];

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(roles).default("analyst"),
  full_name: z.string().min(2).max(120).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(20),
});

module.exports = { registerSchema, loginSchema, refreshSchema, roles };
