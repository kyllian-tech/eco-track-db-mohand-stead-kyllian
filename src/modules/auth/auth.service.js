const crypto = require("crypto");
const repo = require("./auth.repository");
const { hashPassword, comparePassword } = require("../../utils/password");
const { sign, verify } = require("../../utils/jwt");
const { ValidationError, UnauthorizedError } = require("../../utils/errors");

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me";

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
}

async function register(payload) {
  const existing = await repo.findUserByEmail(payload.email);
  if (existing) {
    throw new ValidationError("User already exists");
  }

  const password_hash = await hashPassword(payload.password);
  const user = await repo.createUser({
    email: payload.email,
    role: payload.role || "analyst",
    full_name: payload.full_name || null,
    password_hash,
  });

  return sanitizeUser(user);
}

async function login({ email, password }) {
  const user = await repo.findUserByEmail(email);
  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const match = await comparePassword(password, user.password_hash);
  if (!match) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const access_token = sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, ACCESS_EXPIRES_IN);
  const refresh_token = sign({ sub: user.id, type: "refresh" }, JWT_REFRESH_SECRET, REFRESH_EXPIRES_IN);
  await repo.saveRefreshToken({
    token: refresh_token,
    user_id: user.id,
    created_at: new Date().toISOString(),
  });

  return {
    access_token,
    refresh_token,
    user: sanitizeUser(user),
  };
}

async function refresh(refreshToken) {
  const stored = await repo.findRefreshToken(refreshToken);
  if (!stored) {
    throw new UnauthorizedError("Refresh token revoked or unknown");
  }

  const payload = verify(refreshToken, JWT_REFRESH_SECRET);
  if (payload.type !== "refresh") {
    throw new UnauthorizedError("Invalid refresh token type");
  }

  const user = await repo.findUserById(payload.sub);
  if (!user) {
    throw new UnauthorizedError("User not found for refresh token");
  }

  await repo.revokeRefreshToken(refreshToken);
  const newRefreshToken = sign({ sub: user.id, type: "refresh" }, JWT_REFRESH_SECRET, REFRESH_EXPIRES_IN);
  await repo.saveRefreshToken({
    token: newRefreshToken,
    user_id: user.id,
    created_at: new Date().toISOString(),
  });

  return {
    access_token: sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, ACCESS_EXPIRES_IN),
    refresh_token: newRefreshToken,
  };
}

async function adminCreateUser({ email, password, role, full_name }) {
  const existing = await repo.findUserByEmail(email);
  if (existing) throw new ValidationError("Un compte avec cet email existe déjà");

  const password_hash = await hashPassword(password);
  const user = await repo.createUser({ email, role, full_name: full_name || null, password_hash });

  // Créer le profil associé
  try {
    const { supabaseAdmin } = require("../../config/supabaseAdmin");
    await supabaseAdmin.schema("public").from("profiles").insert({
      id: user.id,
      email: user.email,
      role: user.role,
      points: 0,
    });
  } catch (_) {
    // Profil optionnel — ne bloque pas la création
  }

  return sanitizeUser(user);
}

module.exports = { register, login, refresh, adminCreateUser };
