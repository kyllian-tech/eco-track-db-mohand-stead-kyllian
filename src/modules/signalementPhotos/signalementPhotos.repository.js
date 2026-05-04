// src/modules/signalementPhotos/signalementPhotos.repository.js
const { supabaseAdmin } = require("../../config/supabaseAdmin");

const TABLE = "signalement_photos";

async function findAll({ signalement_id } = {}) {
  let query = supabaseAdmin
    .schema("public")
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (signalement_id) query = query.eq("signalement_id", signalement_id);

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

async function remove(id) {
  const { error } = await supabaseAdmin
    .schema("public")
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

module.exports = { findAll, findById, create, remove };
