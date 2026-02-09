/**
 * Fichier : signalementsControllers.js
 * Rôle : Contrôleur HTTP pour la ressource "signalements".
 * Table : public.signalements
 *
 * Colonnes :
 * - id (uuid)
 * - user_id (uuid, FK)
 * - container_id (uuid, FK)
 * - type_incident (text)
 * - description (text)
 * - statut (ticket_status enum)
 * - longitude (float8)
 * - latitude (float8)
 * - created_at (timestamptz)
 */

const { supabaseAdmin } = require("../config/supabaseAdmin");

const TABLE = "signalements";

/**
 * GET /api/signalements
 * Filtres optionnels :
 * - ?statut=OUVERT
 * - ?user_id=uuid
 * - ?container_id=uuid
 */
exports.list = async (req, res) => {
  try {
    const { statut, user_id, container_id } = req.query;

    let query = supabaseAdmin
      .schema("public")
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (statut) query = query.eq("statut", statut);
    if (user_id) query = query.eq("user_id", user_id);
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
    console.error("[signalements] list crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/signalements/:id
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

    if (!data) return res.status(404).json({ error: "Signalement introuvable" });

    return res.json(data);
  } catch (e) {
    console.error("[signalements] getById crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/signalements
 *
 * Body attendu :
 * {
 *   "user_id": "uuid",
 *   "container_id": "uuid",
 *   "type_incident": "Débordement",
 *   "description": "Le conteneur déborde depuis 2 jours",
 *   "statut": "OUVERT",
 *   "longitude": 2.3522,
 *   "latitude": 48.8566
 * }
 */
exports.create = async (req, res) => {
  try {
    const {
      user_id,
      container_id,
      type_incident,
      description = null,
      statut,
      longitude = null,
      latitude = null,
    } = req.body || {};

    if (!user_id || !container_id || !type_incident || !statut) {
      return res.status(400).json({
        error: "user_id, container_id, type_incident et statut sont requis",
      });
    }

    if (longitude !== null && typeof longitude !== "number") {
      return res.status(400).json({ error: "longitude doit être un nombre" });
    }
    if (latitude !== null && typeof latitude !== "number") {
      return res.status(400).json({ error: "latitude doit être un nombre" });
    }
    if (longitude !== null && (longitude < -180 || longitude > 180)) {
      return res.status(400).json({ error: "longitude doit être entre -180 et 180" });
    }
    if (latitude !== null && (latitude < -90 || latitude > 90)) {
      return res.status(400).json({ error: "latitude doit être entre -90 et 90" });
    }

    const payload = {
      user_id,
      container_id,
      type_incident,
      description,
      statut,
      longitude,
      latitude,
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
    console.error("[signalements] create crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PATCH /api/signalements/:id
 * Body possible :
 * {
 *   "statut": "EN_COURS",
 *   "description": "Pris en charge par l'équipe"
 * }
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const { type_incident, description, statut, longitude, latitude } = req.body || {};
    const patch = {};

    if (typeof type_incident !== "undefined") patch.type_incident = type_incident;
    if (typeof description !== "undefined") patch.description = description;
    if (typeof statut !== "undefined") patch.statut = statut;

    if (typeof longitude !== "undefined") {
      if (longitude !== null && typeof longitude !== "number") {
        return res.status(400).json({ error: "longitude doit être un nombre" });
      }
      if (longitude !== null && (longitude < -180 || longitude > 180)) {
        return res.status(400).json({ error: "longitude doit être entre -180 et 180" });
      }
      patch.longitude = longitude;
    }

    if (typeof latitude !== "undefined") {
      if (latitude !== null && typeof latitude !== "number") {
        return res.status(400).json({ error: "latitude doit être un nombre" });
      }
      if (latitude !== null && (latitude < -90 || latitude > 90)) {
        return res.status(400).json({ error: "latitude doit être entre -90 et 90" });
      }
      patch.latitude = latitude;
    }

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
      return res.status(404).json({ error: "Signalement introuvable" });
    }

    return res.json(data[0]);
  } catch (e) {
    console.error("[signalements] update crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * DELETE /api/signalements/:id
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
    console.error("[signalements] remove crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
