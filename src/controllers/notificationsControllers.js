/**
 * Fichier : notificationsControllers.js
 * Rôle : Contrôleur HTTP pour la ressource "notifications".
 * Table : public.notifications
 *
 * Colonnes :
 * - id (uuid)
 * - user_id (uuid, FK -> profiles.id)
 * - titre (text)
 * - message (text)
 * - est_lu (boolean)
 * - created_at (timestamptz)
 */

const { supabaseAdmin } = require("../config/supabaseAdmin");

const TABLE = "notifications";

/**
 * GET /api/notifications
 * Optionnel: ?user_id=...&est_lu=true|false
 */
exports.list = async (req, res) => {
  try {
    const { user_id, est_lu } = req.query;

    let query = supabaseAdmin
      .schema("public")
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (user_id) query = query.eq("user_id", user_id);

    if (typeof est_lu !== "undefined") {
      // "true"/"false" -> boolean
      const boolVal = String(est_lu).toLowerCase() === "true";
      query = query.eq("est_lu", boolVal);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    }

    return res.json(data);
  } catch (e) {
    console.error("[notifications] list crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/notifications/:id
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
      return res.status(400).json({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    }

    if (!data) return res.status(404).json({ error: "Notification introuvable" });

    return res.json(data);
  } catch (e) {
    console.error("[notifications] getById crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/notifications
 * Body attendu:
 * {
 *   "user_id": "uuid",
 *   "titre": "text",
 *   "message": "text",
 *   "est_lu": false (optionnel)
 * }
 */
exports.create = async (req, res) => {
  try {
    const { user_id, titre, message, est_lu } = req.body || {};

    if (!user_id || !titre || !message) {
      return res.status(400).json({
        error: "user_id, titre et message sont requis",
      });
    }

    const payload = {
      user_id,
      titre,
      message,
      est_lu: typeof est_lu === "boolean" ? est_lu : false,
    };

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from(TABLE)
      .insert(payload)
      .select("*"); // renvoie un tableau

    if (error) {
      return res.status(400).json({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    }

    return res.status(201).json(data?.[0] ?? null);
  } catch (e) {
    console.error("[notifications] create crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PATCH /api/notifications/:id
 * Body possible:
 * { "titre": "...", "message": "...", "est_lu": true/false }
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const { titre, message, est_lu } = req.body || {};
    const patch = {};

    if (typeof titre !== "undefined") patch.titre = titre;
    if (typeof message !== "undefined") patch.message = message;
    if (typeof est_lu !== "undefined") patch.est_lu = est_lu;

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from(TABLE)
      .update(patch)
      .eq("id", id)
      .select("*"); // tableau

    if (error) {
      return res.status(400).json({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Notification introuvable" });
    }

    return res.json(data[0]);
  } catch (e) {
    console.error("[notifications] update crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * DELETE /api/notifications/:id
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
      return res.status(400).json({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    }

    return res.status(204).send();
  } catch (e) {
    console.error("[notifications] remove crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * BONUS : PATCH /api/notifications/:id/read  (si tu veux une route dédiée)
 * -> marque une notification comme lue
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from(TABLE)
      .update({ est_lu: true })
      .eq("id", id)
      .select("*");

    if (error) {
      return res.status(400).json({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Notification introuvable" });
    }

    return res.json(data[0]);
  } catch (e) {
    console.error("[notifications] markAsRead crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
