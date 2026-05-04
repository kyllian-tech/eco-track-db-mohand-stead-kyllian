// src/modules/ticketsSupport/ticketsSupport.repository.js
const { supabaseAdmin } = require("../../config/supabaseAdmin");

const TABLE = "tickets_support";

async function findAll({ statut, priorite, user_id } = {}) {
  let query = supabaseAdmin
    .schema("public")
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (statut) query = query.eq("statut", statut);
  if (priorite) query = query.eq("priorite", priorite);
  if (user_id) query = query.eq("user_id", user_id);

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

module.exports = { findAll, findById, create, update, remove };
