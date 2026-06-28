const path = require("path");
const crypto = require("crypto");
const { readJson, writeJson } = require("../../utils/file-store");

const USERS_FILE = path.resolve(__dirname, "../../data/users.json");
const TOKENS_FILE = path.resolve(__dirname, "../../data/refresh-tokens.json");

// Détecte si Supabase est configuré avec de vraies valeurs
function isSupabaseConfigured() {
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return (
    url.startsWith("https://") &&
    !url.includes("VOTRE_PROJECT_ID") &&
    key.length > 20 &&
    !key.includes("VOTRE_")
  );
}

// ── SUPABASE ──────────────────────────────────────────────────────────────────

async function findUserByEmailSupabase(email) {
  const { supabaseAdmin } = require("../../config/supabaseAdmin");
  const { data, error } = await supabaseAdmin
    .schema("public")
    .from("users")
    .select("*")
    .ilike("email", email)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function findUserByIdSupabase(id) {
  const { supabaseAdmin } = require("../../config/supabaseAdmin");
  const { data, error } = await supabaseAdmin
    .schema("public")
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function createUserSupabase({ email, role, full_name, password_hash }) {
  const { supabaseAdmin } = require("../../config/supabaseAdmin");
  const { data, error } = await supabaseAdmin
    .schema("public")
    .from("users")
    .insert({ email, role, full_name: full_name || null, password_hash })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function saveRefreshTokenSupabase({ token, user_id, created_at }) {
  const { supabaseAdmin } = require("../../config/supabaseAdmin");
  // expires_at = created_at + 7 jours (durée du refresh token)
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .schema("public")
    .from("user_refresh_tokens")
    .insert({ token, user_id, created_at, expires_at })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function findRefreshTokenSupabase(token) {
  const { supabaseAdmin } = require("../../config/supabaseAdmin");
  const { data, error } = await supabaseAdmin
    .schema("public")
    .from("user_refresh_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function revokeRefreshTokenSupabase(token) {
  const { supabaseAdmin } = require("../../config/supabaseAdmin");
  const { error } = await supabaseAdmin
    .schema("public")
    .from("user_refresh_tokens")
    .delete()
    .eq("token", token);
  if (error) throw error;
}

// ── JSON LOCAL (fallback dev sans Supabase) ───────────────────────────────────

async function findUserByEmailLocal(email) {
  const users = await readJson(USERS_FILE, []);
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

async function findUserByIdLocal(id) {
  const users = await readJson(USERS_FILE, []);
  return users.find((u) => u.id === id) || null;
}

async function createUserLocal(payload) {
  const users = await readJson(USERS_FILE, []);
  const user = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...payload };
  users.push(user);
  await writeJson(USERS_FILE, users);
  return user;
}

async function saveRefreshTokenLocal(payload) {
  const tokens = await readJson(TOKENS_FILE, []);
  tokens.push(payload);
  await writeJson(TOKENS_FILE, tokens);
  return payload;
}

async function findRefreshTokenLocal(token) {
  const tokens = await readJson(TOKENS_FILE, []);
  return tokens.find((t) => t.token === token) || null;
}

async function revokeRefreshTokenLocal(token) {
  const tokens = await readJson(TOKENS_FILE, []);
  await writeJson(TOKENS_FILE, tokens.filter((t) => t.token !== token));
}

// ── EXPORTS (sélection automatique) ──────────────────────────────────────────

function pick(supabaseFn, localFn) {
  return (...args) => {
    if (isSupabaseConfigured()) return supabaseFn(...args);
    return localFn(...args);
  };
}

module.exports = {
  findUserByEmail:    pick(findUserByEmailSupabase,    findUserByEmailLocal),
  findUserById:       pick(findUserByIdSupabase,       findUserByIdLocal),
  createUser:         pick(createUserSupabase,         createUserLocal),
  saveRefreshToken:   pick(saveRefreshTokenSupabase,   saveRefreshTokenLocal),
  findRefreshToken:   pick(findRefreshTokenSupabase,   findRefreshTokenLocal),
  revokeRefreshToken: pick(revokeRefreshTokenSupabase, revokeRefreshTokenLocal),
};
