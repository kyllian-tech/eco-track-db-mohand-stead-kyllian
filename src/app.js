require('dotenv').config()
const express = require('express')
const cors = require('cors')
console.log("[routes] notificationsRoutes loaded");

const profilesRoutes = require('./routes/profilesRoutes')
const badgesRoutes = require('./routes/badgesRoutes')
const challengesRoutes = require('./routes/challengesRoutes')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true }))

app.use('/api/profiles', profilesRoutes)
app.use('/api/badges', badgesRoutes)
app.use('/api/challenges', challengesRoutes)
app.use("/api/notifications", require("./routes/notificationsRoutes"));
app.use("/api/zones", require("./routes/zonesRoutes"));
app.use("/api/containers", require("./routes/containersRoutes"));
app.use("/api/measurements", require("./routes/measurementsRoutes"));
app.use("/api/routes", require("./routes/routesRoutes"));



// Erreurs
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`API running on http://localhost:${port}`))

app.use((err, req, res, next) => {
  console.error("[ERROR middleware]", err);
  res.status(500).json({
    error: String(err),
    cause: err?.cause ? String(err.cause) : null
  });
});

