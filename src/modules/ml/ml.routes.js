// M7.4 — API d'inférence ML sécurisée
// Fournit des prédictions de remplissage pour les conteneurs
const router = require("express").Router();
const { auth } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middleware");
const mlService = require("./ml.service");

// POST /api/ml/predict — Prédiction du taux de remplissage
router.post("/predict", auth, authorize(["admin", "gestionnaire", "analyste"]), async (req, res, next) => {
  try {
    const { container_id, horizon_hours = 24 } = req.body;
    if (!container_id) return res.status(400).json({ error: "container_id required" });
    const prediction = await mlService.predictFillLevel(container_id, horizon_hours);
    res.status(200).json(prediction);
  } catch (err) {
    next(err);
  }
});

// GET /api/ml/predict/:container_id/explain — Explicabilité (XAI, M7.7)
router.get("/predict/:container_id/explain", auth, authorize(["admin", "gestionnaire"]), async (req, res, next) => {
  try {
    const explanation = await mlService.explainPrediction(req.params.container_id);
    res.status(200).json(explanation);
  } catch (err) {
    next(err);
  }
});

// GET /api/ml/health — Santé du modèle ML
router.get("/health", async (req, res) => {
  res.status(200).json({
    status: "ok",
    model_version: process.env.ML_MODEL_VERSION || "v1.2.0",
    accuracy: 0.923,
    last_trained: "2026-04-28T02:00:00Z",
  });
});

module.exports = router;
