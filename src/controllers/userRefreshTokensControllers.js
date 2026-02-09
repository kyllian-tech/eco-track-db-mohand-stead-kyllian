/**
 * Fichier : userRefreshTokensControllers.js
 * Rôle : Contrôleur HTTP pour la ressource "user_refresh_tokens".
 * Table : public.user_refresh_tokens
 *
 * Colonnes :
 * - id (uuid)
 * - user_id (uuid, FK)
 * - token (text)
 * - expires_at (timestamptz)
 * - created_at (timestamptz)
 */

const { supabaseAdmin } = require("../config/supabaseAdmin");

const TABLE = "user_refresh_tokens";

/**
 * GET /api/user-refresh-tokens
 * Filtres optionnels :
 * - ?user_id=uuid
 * - ?active=true|false  (active = expires_at > now)
 */
exports.list = async (req, res) => {
  try {
    const { user_id, active } = req.query;

    let query = supabaseAdmin
      .schema("public")
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (user_id) query = query.eq("user_id", user_id);

    if (typeof active !== "undefined") {
      const boolVal = String(active).toLowerCase() === "true";
      const nowIso = new Date().toISOString();
      query = boolVal ? query.gt("expires_at", nowIso) : query.lte("expires_at", nowIso);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({
        message: error.message,
        details: error.details,
        code: error.code,
      });
    }

    return res.json(data);
  } catch (e) {
    console.error("[user_refresh_tokens] list crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/user-refresh-tokens/:id
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
        code: error.code,
      });
    }

    if (!data) return res.status(404).json({ error: "Refresh token introuvable" });

    return res.json(data);
  } catch (e) {
    console.error("[user_refresh_tokens] getById crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/user-refresh-tokens
 * Body attendu :
 * {
 *   "user_id": "uuid",
 *   "token": "string",
 *   "expires_at": "2026-02-01T00:00:00Z"  // optionnel si default côté DB
 * }
 *
 * NOTE sécurité :
 * - En prod, on stocke idéalement un hash du token (pas le token brut).
 */
exports.create = async (req, res) => {
  try {
    const { user_id, token, expires_at = null } = req.body || {};

    if (!user_id || !token) {
      return res.status(400).json({ error: "user_id et token sont requis" });
    }

    if (typeof token !== "string" || token.length < 20) {
      return res.status(400).json({ error: "token invalide (trop court)" });
    }

    const payload = {
      user_id,
      token,
      ...(expires_at ? { expires_at } : {}),
    };

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from(TABLE)
      .insert(payload)
      .select("*"); // tableau

    if (error) {
      return res.status(400).json({
        message: error.message,
        details: error.details,
        code: error.code,
      });
    }

    return res.status(201).json(data?.[0] ?? null);
  } catch (e) {
    console.error("[user_refresh_tokens] create crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PATCH /api/user-refresh-tokens/:id
 * Body possible :
 * { "expires_at": "..." }
 * (souvent on évite de modifier token en place)
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { expires_at } = req.body || {};

    if (typeof expires_at === "undefined") {
      return res.status(400).json({ error: "expires_at est requis" });
    }

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from(TABLE)
      .update({ expires_at })
      .eq("id", id)
      .select("*");

    if (error) {
      return res.status(400).json({
        message: error.message,
        details: error.details,
        code: error.code,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Refresh token introuvable" });
    }

    return res.json(data[0]);
  } catch (e) {
    console.error("[user_refresh_tokens] update crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * DELETE /api/user-refresh-tokens/:id
 */
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .schema("public")
      .from(TABLE)
      .delete()
      .eq("id", id);

    if (error) return res.status(400).json({ message: error.message });

    return res.status(204).send();
  } catch (e) {
    console.error("[user_refresh_tokens] remove crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * BONUS : DELETE /api/user-refresh-tokens/by-user/:user_id
 * Révoque tous les refresh tokens d'un utilisateur
 */
exports.removeByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const { error } = await supabaseAdmin
      .schema("public")
      .from(TABLE)
      .delete()
      .eq("user_id", user_id);

    if (error) return res.status(400).json({ message: error.message });

    return res.status(204).send();
  } catch (e) {
    console.error("[user_refresh_tokens] removeByUser crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
