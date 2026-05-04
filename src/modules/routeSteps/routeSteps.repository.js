// src/modules/routeSteps/routeSteps.repository.js
const { supabaseAdmin } = require("../../config/supabaseAdmin");

const TABLE = "route_steps";

async function findAll({ route_id, container_id } = {}) {
  let query = supabaseAdmin
    .schema("public")
    .from(TABLE)
    .select("*")
    .order("ordre_passage", { ascending: true });

  if (route_id) query = query.eq("route_id", route_id);
  if (container_id) query = query.eq("container_id", container_id);

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

async function findByRouteId(route_id) {
  const { data, error } = await supabaseAdmin
    .schema("public")
    .from(TABLE)
    .select("*")
    .eq("route_id", route_id)
    .order("ordre_passage", { ascending: true });

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

module.exports = { findAll, findById, findByRouteId, create, update, remove };
