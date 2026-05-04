// src/modules/bins/bins.schema.js
const { z } = require("zod");

const wasteTypes = ["PLASTIQUE", "VERRE", "PAPIER", "ORGANIQUE", "MIXTE"];

const geoPointSchema = z.object({
  type: z.literal("Point"),
  coordinates: z
    .array(z.number())
    .length(2, "coordinates doit contenir [longitude, latitude]")
    .refine(
      ([lon, lat]) => lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90,
      { message: "longitude/latitude invalides" }
    ),
});

const createBinSchema = z.object({
  code: z
    .string()
    .min(3, "code trop court")
    .max(30, "code trop long"),

  type: z.enum(wasteTypes),

  capacite_litres: z
    .number({ invalid_type_error: "capacite_litres doit être un nombre" })
    .positive("capacite_litres doit être positif")
    .max(10000, "capacite_litres trop grand"),

  zone_id: z
  .string()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    "zone_id doit être au format UUID de la base"
  ),

  position: geoPointSchema,

  derniere_maintenance: z.string().datetime().optional().nullable(),
});

const updateBinSchema = createBinSchema.partial();

module.exports = {
  createBinSchema,
  updateBinSchema,
};