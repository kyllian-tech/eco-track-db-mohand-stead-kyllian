require('dotenv').config()
const express = require('express')
const cors = require('cors')

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

// Erreurs
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`API running on http://localhost:${port}`))
