// src/modules/measurements/measurements.repository.js
const { supabaseAdmin } = require("../../config/supabaseAdmin");

const TABLE = "measurements";

async function findAll({ container_id, from, to, limit } = {}) {
  let query = supabaseAdmin
    .schema("public")
    .from(TABLE)
    .select("*")
    .order("timestamp", { ascending: false });

  if (container_id) query = query.eq("container_id", container_id);
  if (from) query = query.gte("timestamp", from);
  if (to) query = query.lte("timestamp", to);

  const lim = Number(limit);
  if (!Number.isNaN(lim) && lim > 0 && lim <= 1000) query = query.limit(lim);
  else query = query.limit(100);

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

async function update(id, patch) {
  const { data, error } = await supabaseAdmin
    .schema("public")
    .from(TABLE)
    .update(patch)
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

async function findLatestByContainerId(container_id) {
  const { data, error } = await supabaseAdmin
    .schema("public")
    .from(TABLE)
    .select("*")
    .eq("container_id", container_id)
    .order("timestamp", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0] ?? null;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findLatestByContainerId,
};
