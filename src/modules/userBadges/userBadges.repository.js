// src/modules/userBadges/userBadges.repository.js
const { supabaseAdmin } = require("../../config/supabaseAdmin");

const TABLE = "user_badges";

async function findAll({ user_id, badge_id } = {}) {
  let query = supabaseAdmin
    .schema("public")
    .from(TABLE)
    .select("*")
    .order("date_obtention", { ascending: false });

  if (user_id) query = query.eq("user_id", user_id);
  if (badge_id) query = query.eq("badge_id", badge_id);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function findOne(user_id, badge_id) {
  const { data, error } = await supabaseAdmin
    .schema("public")
    .from(TABLE)
    .select("*")
    .eq("user_id", user_id)
    .eq("badge_id", badge_id)
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

async function remove(user_id, badge_id) {
  const { error } = await supabaseAdmin
    .schema("public")
    .from(TABLE)
    .delete()
    .eq("user_id", user_id)
    .eq("badge_id", badge_id);

  if (error) throw error;
  return true;
}

module.exports = { findAll, findOne, create, remove };