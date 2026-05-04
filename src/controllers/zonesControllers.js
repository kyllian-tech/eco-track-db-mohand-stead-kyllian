/**
 * Fichier : zonesControllers.js
 * Rôle : Contrôleur HTTP pour la ressource "zones".
 * Table : public.zones
 *
 * Colonnes :
 * - id (uuid)
 * - nom (varchar)
 * - description (text)
 * - geometry (geometry)  // PostGIS
 * - created_at (timestamptz)
 */

const { supabaseAdmin } = require("../config/supabaseAdmin");

const TABLE = "zones";

/**
 * GET /api/zones
 */
exports.list = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .schema("public")
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

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
    console.error("[zones] list crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/zones/:id
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

    if (!data) return res.status(404).json({ error: "Zone introuvable" });

    return res.json(data);
  } catch (e) {
    console.error("[zones] getById crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/zones
 *
 * Body attendu (geometry en GeoJSON):
 * {
 *   "nom": "Zone A",
 *   "description": "Zone de test",
 *   "geometry": { "type": "Point", "coordinates": [2.3522, 48.8566] }
 * }
 *
 * Notes:
 * - On convertit GeoJSON -> geometry via ST_GeomFromGeoJSON
 * - Pour Polygon/LineString, le GeoJSON marche aussi.
 */
exports.create = async (req, res) => {
  try {
    const { nom, description = null, geometry } = req.body || {};

    if (!nom) {
      return res.status(400).json({ error: "nom est requis" });
    }

    // Geometry optionnelle, mais si fournie, on attend du GeoJSON valide
    let geomGeoJson = null;
    if (typeof geometry !== "undefined" && geometry !== null) {
      if (typeof geometry !== "object" || !geometry.type || !geometry.coordinates) {
        return res.status(400).json({
          error: "geometry doit être un GeoJSON valide (type + coordinates)",
        });
      }
      geomGeoJson = JSON.stringify(geometry);
    }

    // On passe par une requête SQL pour convertir GeoJSON -> geometry proprement
    // Supabase Admin supporte .rpc si tu crées une fonction, sinon on peut faire sans conversion
    // Ici: insertion directe si geometry est déjà au bon type, sinon on utilise une RPC (recommandé).
    //
    // ==> Option simple (si tu stockes déjà du GeoJSON en DB, pas ton cas)
    // ==> Option robuste: créer une RPC SQL 'zones_create' (voir plus bas)

    // --- Option robuste via RPC ---
    // Si tu n'as pas encore la RPC, commente ce bloc et utilise l'insert direct plus bas.
    const { data, error } = await supabaseAdmin
      .schema("public")
      .rpc("zones_create", {
        p_nom: nom,
        p_description: description,
        p_geometry_geojson: geomGeoJson, // peut être null
      });

    if (error) {
      return res.status(400).json({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    }

    return res.status(201).json(data);
  } catch (e) {
    console.error("[zones] create crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PATCH /api/zones/:id
 *
 * Body possible :
 * { "nom": "...", "description": "...", "geometry": {GeoJSON} }
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, geometry } = req.body || {};

    const patch = {};
    if (typeof nom !== "undefined") patch.nom = nom;
    if (typeof description !== "undefined") patch.description = description;

    let geomGeoJson = undefined;
    if (typeof geometry !== "undefined") {
      if (geometry === null) {
        geomGeoJson = null; // pour effacer geometry
      } else {
        if (typeof geometry !== "object" || !geometry.type || !geometry.coordinates) {
          return res.status(400).json({
            error: "geometry doit être un GeoJSON valide (type + coordinates)",
          });
        }
        geomGeoJson = JSON.stringify(geometry);
      }
    }

    if (Object.keys(patch).length === 0 && typeof geomGeoJson === "undefined") {
      return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }

    // --- Option robuste via RPC ---
    const { data, error } = await supabaseAdmin
      .schema("public")
      .rpc("zones_update", {
        p_id: id,
        p_nom: typeof patch.nom !== "undefined" ? patch.nom : null,
        p_description: typeof patch.description !== "undefined" ? patch.description : null,
        p_geometry_geojson: typeof geomGeoJson !== "undefined" ? geomGeoJson : "__NOCHANGE__",
      });

    if (error) {
      return res.status(400).json({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    }

    if (!data) return res.status(404).json({ error: "Zone introuvable" });

    return res.json(data);
  } catch (e) {
    console.error("[zones] update crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * DELETE /api/zones/:id
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
    console.error("[zones] remove crash:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
