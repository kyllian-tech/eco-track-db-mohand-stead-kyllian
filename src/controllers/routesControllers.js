/**
 * Fichier : routesControllers.js
 * Rôle : Contrôleur HTTP pour la ressource "routes".
 * Table : public.routes
 *
 * Colonnes :
 * - id (uuid)
 * - nom (text)
 * - date_prevue (timestamptz)
 * - statut (route_status enum)
 * - agent_id (uuid)
 * - distance_estimee_km (float)
 */

const { supabaseAdmin } = require("../config/supabaseAdmin");

const TABLE = "routes";

/**
 * GET /api/routes
 * Filtres optionnels :
 * - ?statut=PLANIFIEE
 * - ?agent_id=uuid
 */
exports.list = async (req, res) => {
  try {
    const { statut, agent_id } = req.query;

    let query = supabaseAdmin
      .schema("public")
      .from(TABLE)
      .select("*")
      .order("date_prevue", { ascending: true });

    if (statut) query = query.eq("statut", statut);
    if (agent_id) query = query.eq("agent_id", agent_id);

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
    console.error("[routes] list crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/routes/:id
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

    if (!data) return res.status(404).json({ error: "Route introuvable" });

    return res.json(data);
  } catch (e) {
    console.error("[routes] getById crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/routes
 *
 * Body attendu :
 * {
 *   "nom": "Tournée centre-ville",
 *   "date_prevue": "2026-01-20T08:00:00Z",
 *   "statut": "PLANIFIEE",
 *   "agent_id": "uuid",
 *   "distance_estimee_km": 12.5
 * }
 */
exports.create = async (req, res) => {
  try {
    const {
      nom,
      date_prevue,
      statut,
      agent_id = null,
      distance_estimee_km = null,
    } = req.body || {};

    if (!nom || !date_prevue || !statut) {
      return res.status(400).json({
        error: "nom, date_prevue et statut sont requis",
      });
    }

    const payload = {
      nom,
      date_prevue,
      statut,
      agent_id,
      distance_estimee_km,
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
        hint: error.hint,
        code: error.code,
      });
    }

    return res.status(201).json(data?.[0] ?? null);
  } catch (e) {
    console.error("[routes] create crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PATCH /api/routes/:id
 * Body possible :
 * { "nom": "...", "statut": "EN_COURS", "distance_estimee_km": 14.2 }
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, date_prevue, statut, agent_id, distance_estimee_km } = req.body || {};

    const patch = {};
    if (typeof nom !== "undefined") patch.nom = nom;
    if (typeof date_prevue !== "undefined") patch.date_prevue = date_prevue;
    if (typeof statut !== "undefined") patch.statut = statut;
    if (typeof agent_id !== "undefined") patch.agent_id = agent_id;
    if (typeof distance_estimee_km !== "undefined") patch.distance_estimee_km = distance_estimee_km;

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
        hint: error.hint,
        code: error.code,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Route introuvable" });
    }

    return res.json(data[0]);
  } catch (e) {
    console.error("[routes] update crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * DELETE /api/routes/:id
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
    console.error("[routes] remove crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
