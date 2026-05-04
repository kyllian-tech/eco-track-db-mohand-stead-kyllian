const router = require("express").Router();
const controller = require("./health.controller");

router.get("/", controller.overview);
router.get("/db", controller.database);
router.get("/redis", controller.redis);
router.get("/live", controller.liveness);   // K8s liveness probe
router.get("/ready", controller.readiness); // K8s readiness probe
router.get("/full", controller.full);       // detailed report

module.exports = router;
