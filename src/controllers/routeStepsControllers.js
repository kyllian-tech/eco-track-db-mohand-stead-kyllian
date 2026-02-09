/**
 * Fichier : routeStepsControllers.js
 * Rôle : Contrôleur HTTP pour la ressource "route_steps".
 * Table : public.route_steps
 *
 * Colonnes :
 * - id (uuid)
 * - route_id (uuid, FK)
 * - container_id (uuid, FK)
 * - ordre_passage (int4)
 * - collecte_effectuee (bool)
 * - heure_passage (timestamptz)
 */

const { supabaseAdmin } = require("../config/supabaseAdmin");

const TABLE = "route_steps";

/**
 * GET /api/route-steps
 * Filtres optionnels :
 * - ?route_id=uuid
 * - ?container_id=uuid
 */
exports.list = async (req, res) => {
  try {
    const { route_id, container_id } = req.query;

    let query = supabaseAdmin
      .schema("public")
      .from(TABLE)
      .select("*")
      .order("ordre_passage", { ascending: true });

    if (route_id) query = query.eq("route_id", route_id);
    if (container_id) query = query.eq("container_id", container_id);

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
    console.error("[route_steps] list crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/route-steps/:id
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

    if (!data) return res.status(404).json({ error: "Étape introuvable" });

    return res.json(data);
  } catch (e) {
    console.error("[route_steps] getById crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * BONUS : GET /api/route-steps/by-route/:route_id
 * Retourne les étapes d'une route triées par ordre_passage
 */
exports.listByRoute = async (req, res) => {
  try {
    const { route_id } = req.params;

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from(TABLE)
      .select("*")
      .eq("route_id", route_id)
      .order("ordre_passage", { ascending: true });

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
    console.error("[route_steps] listByRoute crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/route-steps
 *
 * Body attendu :
 * {
 *   "route_id": "uuid",
 *   "container_id": "uuid",
 *   "ordre_passage": 1,
 *   "collecte_effectuee": false,
 *   "heure_passage": "2026-01-20T09:15:00Z" // optionnel
 * }
 */
exports.create = async (req, res) => {
  try {
    const {
      route_id,
      container_id,
      ordre_passage,
      collecte_effectuee = false,
      heure_passage = null,
    } = req.body || {};

    if (!route_id || !container_id || typeof ordre_passage === "undefined") {
      return res.status(400).json({
        error: "route_id, container_id et ordre_passage sont requis",
      });
    }

    const payload = {
      route_id,
      container_id,
      ordre_passage,
      collecte_effectuee: typeof collecte_effectuee === "boolean" ? collecte_effectuee : false,
      heure_passage,
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
        hint: error.hint,
        code: error.code,
      });
    }

    return res.status(201).json(data?.[0] ?? null);
  } catch (e) {
    console.error("[route_steps] create crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PATCH /api/route-steps/:id
 * Body possible :
 * { "ordre_passage": 2, "collecte_effectuee": true, "heure_passage": "..." }
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { ordre_passage, collecte_effectuee, heure_passage } = req.body || {};

    const patch = {};
    if (typeof ordre_passage !== "undefined") patch.ordre_passage = ordre_passage;
    if (typeof collecte_effectuee !== "undefined") patch.collecte_effectuee = collecte_effectuee;
    if (typeof heure_passage !== "undefined") patch.heure_passage = heure_passage;

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
      return res.status(404).json({ error: "Étape introuvable" });
    }

    return res.json(data[0]);
  } catch (e) {
    console.error("[route_steps] update crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * DELETE /api/route-steps/:id
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
    console.error("[route_steps] remove crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
