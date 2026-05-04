# Changelog — EcoTrack API

All notable changes to this project will be documented in this file.  
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

### Added
- M7.x MLOps pipeline (Kubeflow/MLflow, Feature Store)

---

## [2.0.0] — 2026-05-03

### Added — DevOps & Infrastructure (M4.x, M9.x)
- Dockerfile multi-stage optimisé (image < 200MB, utilisateur non-root) — M9.4
- Pipeline CI/CD GitLab 7 stages (lint → test → security → build → staging → perf → prod) — M9.1
- Stratégie de déploiement Blue/Green dans le pipeline CI/CD — M4.6
- Manifests Kubernetes complets (Deployment, Service, Ingress, HPA, NetworkPolicy, PDB) — M9.5
- Helm chart `ecotrack-api` avec values multi-environnements — M9.6
- Terraform remote backend S3 + DynamoDB locking pour le state — M4.7
- Infrastructure Terraform : EKS, RDS, ElastiCache, S3, KMS — M9.2
- HashiCorp Vault policies + External Secrets Operator pour K8s — M4.8
- Network Policies K8s (Zero Trust, deny-all par défaut) — M4.11
- HPA avec métriques CPU + mémoire + custom Prometheus Adapter — M4.10, M11.9
- KEDA ScaledObject pour scale basé sur le lag Kafka
- Ressources Terraform pour Disaster Recovery (S3 backup région secondaire, RDS replication) — M4.15
- Prometheus + Alertmanager configuration complète avec règles métier — M9.9, M13.4
- docker-compose.yml avec API, Redis, Prometheus, Grafana

### Added — Sécurité (M12.x, M6.x)
- Middleware CSP complet (nonces, directives, report-uri) — M12.5
- Middleware HSTS (max-age=31536000, includeSubDomains, preload) — M12.5
- En-têtes de sécurité supplémentaires : Permissions-Policy, COEP, COOP, CORP — M12.5
- Endpoint POST /api/csp-report pour les violations CSP — M12.5
- Audit logger (`src/utils/audit.js`) avec événements de sécurité structurés — M12.9
- Audit middleware pour la traçabilité des accès aux ressources
- Endpoint `/metrics` Prometheus format text/plain — M13.3
- Métriques business : signalements, tournées, fill levels, gamification
- PSSI complète (10 sections) — M6.1
- PIA/AIPD conforme RGPD avec 5 mesures de mitigation — M6.2
- Cartographie des risques EBIOS (10 scénarios, score résiduel) — M6.3
- Configuration OWASP ZAP pour tests automatisés — M10.3
- Stryker mutation testing configuration — M10.4
- `.env.example` avec documentation de toutes les variables — M12.6

### Added — Performance (M11.x)
- Middleware de compression gzip/brotli avec seuil configurable — M11.4
- Headers Vary: Accept-Encoding pour la négociation de contenu

### Added — Observabilité (M13.x)
- Tracing distribué (`src/utils/tracing.js`) compatible W3C Trace Context — M13.1
- Middleware de tracing : injection headers traceparent, X-Trace-Id
- Health checks enrichis : /health/live, /health/ready, /health/full — M13.5
- Liveness probe K8s (détection deadlocks)
- Readiness probe K8s avec vérification des dépendances (DB, Redis)
- Métriques mémoire dans le health full report

### Added — Tests de charge (M10.x)
- K6 smoke test (`tests/load/k6-smoke.js`) — M10.2
- K6 stress test avec scénarios ramp-up et spike — M10.2

### Added — Kafka / Event-driven (M8.x)
- Configuration Kafka avec 8 topics définis (partitions, rétention, compression) — M8.1
- Kafka Producer (`src/kafka/producer.js`) : mesures IoT, événements conteneurs, signalements, gamification, audit — M8.2
- Kafka Consumer Analytics (`src/kafka/consumer.js`) : agrégation 5 min, alertes fill level > 85% — M8.3
- Documentation architecture Kafka (ADR, ADR Kafka vs alternatives) — M8.1

### Added — Documentation (M14.x)
- OpenAPI 3.0 spec complète (`docs/api/openapi.yaml`) — M14.1
- README complet avec badges, structure, endpoints, scripts, déploiement — M14.2
- Diagrammes d'architecture C4 (Mermaid) : contexte, conteneurs, composants — M14.3
- Architecture Kafka documentée avec diagrammes ASCII et séquences — M14.3
- Runbooks opérationnels : High Error Rate, Data Breach, Kafka Lag — M14.5
- CHANGELOG (ce fichier) — M14.6

### Changed
- `src/app.js` : refactoring complet des middlewares (ordre, sécurité, métriques, tracing)
- `src/modules/health/` : health controller/service enrichis avec liveness, readiness, full
- `src/modules/health/health.routes.js` : nouveaux endpoints /live, /ready, /full
- Auth routes : rate limiting `authLimiter` plus strict appliqué (5 req/15min)

### Security
- Suppression du header `X-Powered-By` (fingerprinting)
- Suppression du header `Server`
- `readOnlyRootFilesystem: true` dans le Dockerfile (K8s)
- `allowPrivilegeEscalation: false` dans les pods K8s
- `runAsNonRoot: true` (UID 1000)

---

## [1.0.0] — 2026-04-01

### Added
- Architecture initiale : 16 modules métier (auth, containers, zones, measurements, etc.)
- JWT authentication + refresh tokens
- RBAC avec 5 rôles
- Validation Zod
- Rate limiting en mémoire
- Logs structurés JSON
- Health checks de base
- Configuration PM2 (ecosystem.config.js)
- Tests automatisés (Node.js test runner)
- Documentation technique initiale

[Unreleased]: https://gitlab.com/ecotrack/ecotrack-api/compare/v2.0.0...HEAD
[2.0.0]: https://gitlab.com/ecotrack/ecotrack-api/compare/v1.0.0...v2.0.0
[1.0.0]: https://gitlab.com/ecotrack/ecotrack-api/releases/tag/v1.0.0
