// src/modules/containers/containers.repository.js
const { supabaseAdmin } = require("../../config/supabaseAdmin");

const TABLE = "containers";

async function findAll({ zone_id, type } = {}) {
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
  return data; // peut être null
}

async function createViaRpc({
  code,
  type,
  capacite_litres,
  position_geojson,
  zone_id,
  derniere_maintenance,
}) {
  const { data, error } = await supabaseAdmin.schema("public").rpc(
    "containers_create",
    {
      p_code: code,
      p_type: type,
      p_capacite_litres: capacite_litres,
      p_position_geojson: position_geojson,
      p_zone_id: zone_id,
      p_derniere_maintenance: derniere_maintenance,
    }
  );

  if (error) throw error;
  return data;
}

async function updateViaRpc({
  id,
  code,
  type,
  capacite_litres,
  position_geojson,
  zone_id,
  derniere_maintenance,
}) {
  const { data, error } = await supabaseAdmin.schema("public").rpc(
    "containers_update",
    {
      p_id: id,
      p_code: code ?? null,
      p_type: type ?? null,
      p_capacite_litres: capacite_litres ?? null,
      p_position_geojson: position_geojson,
      p_zone_id: zone_id ?? null,
      p_derniere_maintenance: derniere_maintenance ?? null,
    }
  );

  if (error) throw error;
  return data; // peut être null si introuvable
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

module.exports = { findAll, findById, createViaRpc, updateViaRpc, remove };
