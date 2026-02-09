/**
 * Fichier : ticketsSupportControllers.js
 * Rôle : Contrôleur HTTP pour la ressource "tickets_support".
 * Table : public.tickets_support
 *
 * Colonnes :
 * - id (uuid)
 * - user_id (uuid, FK)
 * - sujet (text)
 * - message (text)
 * - statut (ticket_status enum)
 * - priorite (text)
 * - created_at (timestamptz)
 */

const { supabaseAdmin } = require("../config/supabaseAdmin");

const TABLE = "tickets_support";

/**
 * GET /api/tickets-support
 * Filtres optionnels :
 * - ?statut=OUVERT
 * - ?priorite=HAUTE
 * - ?user_id=uuid
 */
exports.list = async (req, res) => {
  try {
    const { statut, priorite, user_id } = req.query;

    let query = supabaseAdmin
      .schema("public")
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (statut) query = query.eq("statut", statut);
    if (priorite) query = query.eq("priorite", priorite);
    if (user_id) query = query.eq("user_id", user_id);

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
    console.error("[tickets_support] list crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/tickets-support/:id
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

    if (!data) return res.status(404).json({ error: "Ticket introuvable" });

    return res.json(data);
  } catch (e) {
    console.error("[tickets_support] getById crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/tickets-support
 *
 * Body attendu :
 * {
 *   "user_id": "uuid",
 *   "sujet": "Problème application",
 *   "message": "L'application ne se lance plus",
 *   "statut": "OUVERT",
 *   "priorite": "HAUTE"
 * }
 */
exports.create = async (req, res) => {
  try {
    const { user_id, sujet, message, statut, priorite } = req.body || {};

    if (!user_id || !sujet || !message || !statut || !priorite) {
      return res.status(400).json({
        error: "user_id, sujet, message, statut et priorite sont requis",
      });
    }

    const payload = {
      user_id,
      sujet,
      message,
      statut,
      priorite,
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
    console.error("[tickets_support] create crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PATCH /api/tickets-support/:id
 * Body possible :
 * { "statut": "EN_COURS", "priorite": "MOYENNE" }
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { sujet, message, statut, priorite } = req.body || {};

    const patch = {};
    if (typeof sujet !== "undefined") patch.sujet = sujet;
    if (typeof message !== "undefined") patch.message = message;
    if (typeof statut !== "undefined") patch.statut = statut;
    if (typeof priorite !== "undefined") patch.priorite = priorite;

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from(TABLE)
      .update(patch)
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
      return res.status(404).json({ error: "Ticket introuvable" });
    }

    return res.json(data[0]);
  } catch (e) {
    console.error("[tickets_support] update crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * DELETE /api/tickets-support/:id
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
        code: error.code,
      });
    }

    return res.status(204).send();
  } catch (e) {
    console.error("[tickets_support] remove crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
