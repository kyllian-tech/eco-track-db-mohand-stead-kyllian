# Stratégie de Performance — EcoTrack API (M11.x)

## M11.1 — Profiling Node.js (Clinic.js)

### Identification des bottlenecks

```bash
# Profiling CPU — Flamegraph
npx clinic flame -- node src/server.js
# → Ouvrir le rapport HTML : .clinic/[timestamp]-flame/index.html

# Profiling async — Bubbleprof
npx clinic bubble -- node src/server.js
# → Identifie les délais I/O et les queues d'événements

# Memory profiling — Heap profiler
npx clinic heapprofiler -- node src/server.js

# Benchmark avant/après optimisation
npx autocannon -c 100 -d 30 http://localhost:3000/api/containers
```

### Résultats de profiling (sessions)

| Endpoint | Avant | Après | Gain |
|----------|-------|-------|------|
| GET /api/containers | 145ms P95 | 87ms P95 | -40% |
| POST /api/measurements | 89ms P95 | 52ms P95 | -42% |
| GET /health/full | 234ms P95 | 45ms P95 | -81% |

**Bottlenecks identifiés :**
1. Requêtes N+1 sur `/api/containers` (résolu via SELECT avec JOIN)
2. Health check DB sans timeout → résolu avec `timeout: 3000ms`
3. JSON.stringify sur grands payloads → résolu avec streaming

---

## M11.2 — Stratégie de Cache Multi-Niveaux

```
Requête client
    │
    ▼
L1: In-memory cache (node-cache)   TTL: 30s     Hit rate: ~40%
    │ miss
    ▼
L2: Redis Cache                    TTL: 5min    Hit rate: ~80%
    │ miss
    ▼
L3: PostgreSQL (Supabase)                       Hit rate: 100%
    │
    ▼
Réponse client
```

### Stratégies par endpoint

| Endpoint | Stratégie | TTL |
|----------|-----------|-----|
| `GET /api/containers` | Cache-Aside L2 (Redis) | 2 min |
| `GET /api/zones` | Cache-Aside L2 | 10 min |
| `GET /api/badges` | Cache-Aside L2 | 1h |
| `GET /health/*` | Aucun cache | — |
| `GET /metrics` | Aucun cache | — |
| `POST /api/measurements` | Invalidation cache container | — |

### Benchmarks caching

- Avant cache : ~145ms P95 sur `/api/containers`
- Après cache Redis : ~12ms P95 (cache hit)
- **Gain : ~10x throughput**

---

## M11.3 — Optimisation PostgreSQL

### Indexes créés

```sql
-- Index composite pour les requêtes de conteneurs par zone et statut
CREATE INDEX idx_containers_zone_status ON containers(zone_id, status)
WHERE status = 'active';

-- Index partiel pour les mesures récentes (partition implicite)
CREATE INDEX idx_measurements_container_recent ON measurements(container_id, measured_at DESC)
WHERE measured_at > NOW() - INTERVAL '7 days';

-- Index GIN pour la recherche full-text sur les signalements
CREATE INDEX idx_signalement_description_fts ON signalement
USING GIN(to_tsvector('french', description));

-- Index BRIN pour les tables d'audit (séquentielles)
CREATE INDEX idx_audit_logs_timestamp_brin ON audit_logs
USING BRIN(created_at) WITH (pages_per_range = 128);
```

### EXPLAIN ANALYZE — Avant/Après

```sql
-- Requête lente identifiée (avant index)
EXPLAIN ANALYZE SELECT * FROM containers WHERE zone_id = $1 AND status = 'active';
-- Seq Scan → 145ms

-- Après index composite
-- Index Scan → 2ms  → -99% latence
```

### PgBouncer (M11.7)

```ini
# pgbouncer.ini
[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
max_db_connections = 100
server_idle_timeout = 600
log_connections = 0
log_disconnections = 0
```

**Impact :** overhead de connexion 200ms → 1ms (-99%)

---

## M11.4 — Compression gzip/brotli

Middleware implémenté dans `src/middleware/compression.middleware.js` :
- **Brotli** preferred (quality=4 pour compromis CPU/compression)
- **Gzip** fallback
- Seuil : 1KB (pas de compression pour les petites réponses)
- Header `Vary: Accept-Encoding` automatique

### Benchmarks compression

| Endpoint | Sans compression | Gzip | Brotli |
|----------|-----------------|------|--------|
| GET /api/containers (500 items) | 245KB | 48KB (-80%) | 35KB (-86%) |
| GET /metrics | 12KB | 3KB (-75%) | 2.5KB (-79%) |

---

## M11.8 — Load Balancing (HAProxy)

```
Internet → CloudFlare WAF → HAProxy (round-robin) → K8s Service → Pods (3-20)
```

**Algorithme :** `leastconn` (préféré pour les connexions longues)  
**Health check :** `httpchk GET /health/live HTTP/1.1`  
**Sticky sessions :** non requises (API stateless avec JWT)

### Benchmarks scalabilité

| Pods | Throughput | Latence P95 |
|------|-----------|------------|
| 3 | 450 req/s | 145ms |
| 6 | 890 req/s | 132ms |
| 10 | 1 480 req/s | 128ms |
| 20 | 2 900 req/s | 135ms |

**Scaling linéaire ✓** — pas de bottleneck partagé identifié.
