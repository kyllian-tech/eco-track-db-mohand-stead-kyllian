/**
 * Fichier : signalementPhotosControllers.js
 * Table : public.signalement_photos
 *
 * Colonnes :
 * - id (uuid)
 * - signalement_id (uuid, FK)
 * - photo_url (text)
 * - created_at (timestamptz)
 */

const { supabaseAdmin } = require("../config/supabaseAdmin");

const TABLE = "signalement_photos";

/**
 * GET /api/signalement-photos
 * Filtres optionnels :
 * - ?signalement_id=uuid
 */
exports.list = async (req, res) => {
  try {
    const { signalement_id } = req.query;

    let query = supabaseAdmin
      .schema("public")
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (signalement_id) query = query.eq("signalement_id", signalement_id);

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (e) {
    console.error("[signalement_photos] list crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/signalement-photos/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) return res.status(404).json({ error: "Photo introuvable" });

    return res.json(data);
  } catch (e) {
    console.error("[signalement_photos] getById crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/signalement-photos
 *
 * Body attendu :
 * {
 *   "signalement_id": "uuid",
 *   "photo_url": "https://..."
 * }
 */
exports.create = async (req, res) => {
  try {
    const { signalement_id, photo_url } = req.body || {};

    if (!signalement_id || !photo_url) {
      return res.status(400).json({
        error: "signalement_id et photo_url sont requis",
      });
    }

    if (typeof photo_url !== "string" || !photo_url.startsWith("http")) {
      return res.status(400).json({
        error: "photo_url doit être une URL valide",
      });
    }

    const payload = { signalement_id, photo_url };

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from(TABLE)
      .insert(payload)
      .select("*");

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json(data?.[0] ?? null);
  } catch (e) {
    console.error("[signalement_photos] create crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * DELETE /api/signalement-photos/:id
 */
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .schema("public")
      .from(TABLE)
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(204).send();
  } catch (e) {
    console.error("[signalement_photos] remove crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
