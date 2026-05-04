/**
 * Fichier : userBadgesControllers.js
 * Rôle : Contrôleur HTTP pour la ressource "user_badges".
 * Table : public.user_badges
 *
 * Colonnes :
 * - user_id (uuid, FK)
 * - badge_id (uuid, FK)
 * - date_obtention (timestamptz)
 */

const { supabaseAdmin } = require("../config/supabaseAdmin");

const TABLE = "user_badges";

/**
 * GET /api/user-badges
 * Filtres optionnels :
 * - ?user_id=uuid
 * - ?badge_id=uuid
 */
exports.list = async (req, res) => {
  try {
    const { user_id, badge_id } = req.query;

    let query = supabaseAdmin
      .schema("public")
      .from(TABLE)
      .select("*")
      .order("date_obtention", { ascending: false });

    if (user_id) query = query.eq("user_id", user_id);
    if (badge_id) query = query.eq("badge_id", badge_id);

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (e) {
    console.error("[user_badges] list crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/user-badges
 *
 * Body attendu :
 * {
 *   "user_id": "uuid",
 *   "badge_id": "uuid"
 * }
 */
exports.create = async (req, res) => {
  try {
    const { user_id, badge_id } = req.body || {};

    if (!user_id || !badge_id) {
      return res.status(400).json({
        error: "user_id et badge_id sont requis",
      });
    }

    const payload = {
      user_id,
      badge_id,
    };

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from(TABLE)
      .insert(payload)
      .select("*");

    if (error) {
      return res.status(400).json({
        message: error.message,
        details: error.details,
        code: error.code,
      });
    }

    return res.status(201).json(data?.[0] ?? null);
  } catch (e) {
    console.error("[user_badges] create crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * DELETE /api/user-badges
 * Suppression via clés (user_id + badge_id)
 *
 * Body attendu :
 * {
 *   "user_id": "uuid",
 *   "badge_id": "uuid"
 * }
 */
exports.remove = async (req, res) => {
  try {
    const { user_id, badge_id } = req.body || {};

    if (!user_id || !badge_id) {
      return res.status(400).json({
        error: "user_id et badge_id sont requis",
      });
    }

    const { error } = await supabaseAdmin
      .schema("public")
      .from(TABLE)
      .delete()
      .eq("user_id", user_id)
      .eq("badge_id", badge_id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(204).send();
  } catch (e) {
    console.error("[user_badges] remove crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
