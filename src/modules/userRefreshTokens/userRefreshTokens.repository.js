// src/modules/userRefreshTokens/userRefreshTokens.repository.js
const { supabaseAdmin } = require("../../config/supabaseAdmin");

const TABLE = "user_refresh_tokens";

async function findAll({ user_id, active } = {}) {
  let query = supabaseAdmin
    .schema("public")
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (user_id) query = query.eq("user_id", user_id);

  if (typeof active !== "undefined") {
    const nowIso = new Date().toISOString();
    query = active ? query.gt("expires_at", nowIso) : query.lte("expires_at", nowIso);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabaseAdmin
    .schema("public")
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data; // null si introuvable
}

async function create(payload) {
  const { data, error } = await supabaseAdmin
    .schema("public")
    .from(TABLE)
    .insert(payload)
    .select("*");

  if (error) throw error;
  return data?.[0] ?? null;
}

async function updateExpiresAt(id, expires_at) {
  const { data, error } = await supabaseAdmin
    .schema("public")
    .from(TABLE)
    .update({ expires_at })
    .eq("id", id)
    .select("*");

  if (error) throw error;
  return data?.[0] ?? null;
}

async function remove(id) {
  const { error } = await supabaseAdmin
    .schema("public")
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

async function removeByUser(user_id) {
  const { error } = await supabaseAdmin
    .schema("public")
    .from(TABLE)
    .delete()
    .eq("user_id", user_id);

  if (error) throw error;
  return true;
}

module.exports = {
  findAll,
  findById,
  create,
  updateExpiresAt,
  remove,
  removeByUser,
};