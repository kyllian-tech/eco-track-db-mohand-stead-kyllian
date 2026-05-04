// src/modules/profiles/profiles.repository.js
const { supabaseAdmin } = require("../../config/supabaseAdmin");

const TABLE = "profiles";

async function findAll() {
  const { data, error } = await supabaseAdmin.from(TABLE).select("*");
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabaseAdmin
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
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

async function update(id, patch) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

async function remove(id) {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq("id", id);
  if (error) throw error;
  return true;
}

module.exports = { findAll, findById, create, update, remove };
