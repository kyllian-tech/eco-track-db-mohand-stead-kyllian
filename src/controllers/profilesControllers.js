/**
 * Fichier : profilesControllers.js
 * Rôle : Contrôleur HTTP pour la ressource "profiles".
 * - Appelle la base (Supabase)
 * - Renvoie des réponses JSON adaptées
 */

const { supabaseAdmin } = require("../config/supabaseAdmin");

const TABLE = "profiles";

/**
 * GET /api/profiles
 */
exports.list = async (req, res) => {
  console.log("[profiles] list called");
  const { data, error } = await supabaseAdmin.from(TABLE).select("*");
  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
};

/**
 * GET /api/profiles/:id
 */
exports.getById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("id", id).single();
  if (error) return res.status(404).json({ error: error.message });
  return res.json(data);
};

/**
 * POST /api/profiles
 */
exports.create = async (req, res) => {
  const { id, email = null, role = "user", points = 0, avatar_url = null } = req.body;

  if (!id) {
    return res.status(400).json({ error: "id (auth.users.id) requis" });
  }

  const payload = { id, email, role, points, avatar_url };

  const { data, error } = await supabaseAdmin
    .schema("public")
    .from("profiles")
    .insert(payload)
    .select("*")
    .single();

  if (error) return res.status(400).json(error);
  return res.status(201).json(data);
};



/**
 * PATCH /api/profiles/:id
 */
exports.update = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin.from(TABLE).update(req.body).eq("id", id).select("*").single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
};

/**
 * DELETE /api/profiles/:id
 */
exports.remove = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin.from(TABLE).delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });
  return res.status(204).send();
};
