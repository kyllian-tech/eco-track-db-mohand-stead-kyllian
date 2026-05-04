// src/modules/bins/bins.repository.js
const { supabaseAdmin } = require("../../config/supabaseAdmin");

const TABLE = "containers";

async function findAll(filters = {}) {
  const { zone_id, type } = filters;

  let query = supabaseAdmin
    .schema("public")
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (zone_id) query = query.eq("zone_id", zone_id);
  if (type) query = query.eq("type", type);

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

  return data;
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

async function update(id, payload) {
  const { data, error } = await supabaseAdmin
    .schema("public")
    .from(TABLE)
    .update(payload)
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

module.exports = {
  findAll,
  findById,
  create,
  update,
  delete: remove,
};