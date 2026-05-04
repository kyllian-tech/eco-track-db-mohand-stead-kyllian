const router = require("express").Router();
const { renderMetrics } = require("./metrics.service");

// Prometheus scrape endpoint — accessible without auth for monitoring
router.get("/", (req, res) => {
  try {
    const metrics = renderMetrics();
    res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.status(200).send(metrics);
  } catch (err) {
    res.status(500).json({ error: "Failed to render metrics" });
  }
});

module.exports = router;
