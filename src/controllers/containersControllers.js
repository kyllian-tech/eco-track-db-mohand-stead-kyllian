/**
 * Fichier : containersControllers.js
 * Rôle : Contrôleur HTTP pour la ressource "containers".
 * Table : public.containers
 */

const { supabaseAdmin } = require("../config/supabaseAdmin");

const TABLE = "containers";

/**
 * GET /api/containers
 * Filtres optionnels :
 * - ?zone_id=uuid
 * - ?type=ENUM_VALUE
 */
exports.list = async (req, res) => {
  try {
    const { zone_id, type } = req.query;

    let query = supabaseAdmin
      .schema("public")
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (zone_id) query = query.eq("zone_id", zone_id);
    if (type) query = query.eq("type", type);

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
    console.error("[containers] list crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/containers/:id
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

    if (!data) return res.status(404).json({ error: "Container introuvable" });

    return res.json(data);
  } catch (e) {
    console.error("[containers] getById crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/containers
 *
 * Body attendu :
 * {
 *   "code": "CTR-001",
 *   "type": "PLASTIQUE",
 *   "capacite_litres": 1200,
 *   "position": { "type": "Point", "coordinates": [2.35, 48.85] },
 *   "zone_id": "uuid-zone",
 *   "derniere_maintenance": "2026-01-10"
 * }
 */
exports.create = async (req, res) => {
  try {
    const {
      code,
      type,
      capacite_litres,
      position,
      zone_id,
      derniere_maintenance,
    } = req.body || {};

    if (!code || !type || !capacite_litres || !position || !zone_id) {
      return res.status(400).json({
        error: "code, type, capacite_litres, position et zone_id sont requis",
      });
    }

    if (
      typeof position !== "object" ||
      position.type !== "Point" ||
      !Array.isArray(position.coordinates)
    ) {
      return res.status(400).json({
        error: "position doit être un GeoJSON Point valide",
      });
    }

    const payload = {
      code,
      type,
      capacite_litres,
      zone_id,
      derniere_maintenance,
      // conversion GeoJSON -> geometry (PostGIS)
      position: supabaseAdmin.rpc
        ? undefined
        : position, // sécurité, normalement géré via RPC
    };

    // 👉 Insertion via RPC recommandée (voir plus bas)
    const { data, error } = await supabaseAdmin
      .schema("public")
      .rpc("containers_create", {
        p_code: code,
        p_type: type,
        p_capacite_litres: capacite_litres,
        p_position_geojson: JSON.stringify(position),
        p_zone_id: zone_id,
        p_derniere_maintenance: derniere_maintenance,
      });

    if (error) {
      return res.status(400).json({
        message: error.message,
        details: error.details,
        code: error.code,
      });
    }

    return res.status(201).json(data);
  } catch (e) {
    console.error("[containers] create crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PATCH /api/containers/:id
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      type,
      capacite_litres,
      position,
      zone_id,
      derniere_maintenance,
    } = req.body || {};

    let positionGeoJson = "__NOCHANGE__";

    if (typeof position !== "undefined") {
      if (position === null) {
        positionGeoJson = null;
      } else if (
        typeof position !== "object" ||
        position.type !== "Point" ||
        !Array.isArray(position.coordinates)
      ) {
        return res.status(400).json({
          error: "position doit être un GeoJSON Point valide",
        });
      } else {
        positionGeoJson = JSON.stringify(position);
      }
    }

    const { data, error } = await supabaseAdmin
      .schema("public")
      .rpc("containers_update", {
        p_id: id,
        p_code: code ?? null,
        p_type: type ?? null,
        p_capacite_litres: capacite_litres ?? null,
        p_position_geojson: positionGeoJson,
        p_zone_id: zone_id ?? null,
        p_derniere_maintenance: derniere_maintenance ?? null,
      });

    if (error) {
      return res.status(400).json({
        message: error.message,
        details: error.details,
        code: error.code,
      });
    }

    if (!data) return res.status(404).json({ error: "Container introuvable" });

    return res.json(data);
  } catch (e) {
    console.error("[containers] update crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * DELETE /api/containers/:id
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
    console.error("[containers] remove crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
