/**
 * Fichier : measurementsControllers.js
 * Rôle : Contrôleur HTTP pour la ressource "measurements".
 * Table : public.measurements
 *
 * Colonnes :
 * - id (int8)
 * - container_id (uuid)
 * - taux_remplissage (int4)
 * - temperature (float8)
 * - batterie_niveau (int4)
 * - timestamp (timestamptz)
 */

const { supabaseAdmin } = require("../config/supabaseAdmin");

const TABLE = "measurements";

/**
 * GET /api/measurements
 * Filtres optionnels :
 * - ?container_id=uuid
 * - ?from=2026-01-01T00:00:00Z
 * - ?to=2026-01-31T23:59:59Z
 * - ?limit=100
 */
exports.list = async (req, res) => {
  try {
    const { container_id, from, to, limit } = req.query;

    let query = supabaseAdmin
      .schema("public")
      .from(TABLE)
      .select("*")
      .order("timestamp", { ascending: false });

    if (container_id) query = query.eq("container_id", container_id);
    if (from) query = query.gte("timestamp", from);
    if (to) query = query.lte("timestamp", to);

    const lim = Number(limit);
    if (!Number.isNaN(lim) && lim > 0 && lim <= 1000) {
      query = query.limit(lim);
    } else {
      query = query.limit(100);
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
    console.error("[measurements] list crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/measurements/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    // id est int8 -> on laisse en string, PostgREST gère, mais on peut valider
    if (!/^\d+$/.test(String(id))) {
      return res.status(400).json({ error: "id invalide (int8 attendu)" });
    }

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

    if (!data) return res.status(404).json({ error: "Measurement introuvable" });

    return res.json(data);
  } catch (e) {
    console.error("[measurements] getById crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/measurements
 * Body attendu :
 * {
 *   "container_id": "uuid",
 *   "taux_remplissage": 42,
 *   "temperature": 18.5,
 *   "batterie_niveau": 77,
 *   "timestamp": "2026-01-16T10:00:00Z" // optionnel (sinon NOW côté DB si default)
 * }
 */
exports.create = async (req, res) => {
  try {
    const {
      container_id,
      taux_remplissage,
      temperature = null,
      batterie_niveau = null,
      timestamp = null,
    } = req.body || {};

    if (!container_id || typeof taux_remplissage === "undefined") {
      return res.status(400).json({
        error: "container_id et taux_remplissage sont requis",
      });
    }

    // validations simples
    if (typeof taux_remplissage !== "number") {
      return res.status(400).json({ error: "taux_remplissage doit être un nombre" });
    }
    if (taux_remplissage < 0 || taux_remplissage > 100) {
      return res.status(400).json({ error: "taux_remplissage doit être entre 0 et 100" });
    }
    if (temperature !== null && typeof temperature !== "number") {
      return res.status(400).json({ error: "temperature doit être un nombre" });
    }
    if (batterie_niveau !== null && typeof batterie_niveau !== "number") {
      return res.status(400).json({ error: "batterie_niveau doit être un nombre" });
    }

    const payload = {
      container_id,
      taux_remplissage,
      temperature,
      batterie_niveau,
      ...(timestamp ? { timestamp } : {}),
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
    console.error("[measurements] create crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PATCH /api/measurements/:id
 * Body possible :
 * { "taux_remplissage": 50, "temperature": 19.1, "batterie_niveau": 80, "timestamp": "..." }
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(String(id))) {
      return res.status(400).json({ error: "id invalide (int8 attendu)" });
    }

    const { taux_remplissage, temperature, batterie_niveau, timestamp } = req.body || {};
    const patch = {};

    if (typeof taux_remplissage !== "undefined") {
      if (typeof taux_remplissage !== "number") {
        return res.status(400).json({ error: "taux_remplissage doit être un nombre" });
      }
      if (taux_remplissage < 0 || taux_remplissage > 100) {
        return res.status(400).json({ error: "taux_remplissage doit être entre 0 et 100" });
      }
      patch.taux_remplissage = taux_remplissage;
    }

    if (typeof temperature !== "undefined") {
      if (temperature !== null && typeof temperature !== "number") {
        return res.status(400).json({ error: "temperature doit être un nombre" });
      }
      patch.temperature = temperature;
    }

    if (typeof batterie_niveau !== "undefined") {
      if (batterie_niveau !== null && typeof batterie_niveau !== "number") {
        return res.status(400).json({ error: "batterie_niveau doit être un nombre" });
      }
      patch.batterie_niveau = batterie_niveau;
    }

    if (typeof timestamp !== "undefined") patch.timestamp = timestamp;

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
      return res.status(404).json({ error: "Measurement introuvable" });
    }

    return res.json(data[0]);
  } catch (e) {
    console.error("[measurements] update crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * DELETE /api/measurements/:id
 */
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(String(id))) {
      return res.status(400).json({ error: "id invalide (int8 attendu)" });
    }

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
    console.error("[measurements] remove crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * BONUS : GET /api/measurements/latest?container_id=uuid
 * Renvoie la dernière mesure d'un container.
 */
exports.latest = async (req, res) => {
  try {
    const { container_id } = req.query;

    if (!container_id) {
      return res.status(400).json({ error: "container_id est requis" });
    }

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from(TABLE)
      .select("*")
      .eq("container_id", container_id)
      .order("timestamp", { ascending: false })
      .limit(1);

    if (error) {
      return res.status(400).json({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    }

    const one = data?.[0] ?? null;
    if (!one) return res.status(404).json({ error: "Aucune mesure trouvée" });

    return res.json(one);
  } catch (e) {
    console.error("[measurements] latest crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
