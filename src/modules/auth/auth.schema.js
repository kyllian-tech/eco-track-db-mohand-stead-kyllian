const { z } = require("zod");

const roles = ["admin", "gestionnaire", "agent", "analyste", "citoyen"];

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(roles).default("citoyen"),
  full_name: z.string().min(2).max(120).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(20),
});

const adminCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(["gestionnaire", "agent", "admin", "analyste"]),
  full_name: z.string().min(2).max(120).optional(),
});

module.exports = { registerSchema, loginSchema, refreshSchema, adminCreateSchema, roles };
