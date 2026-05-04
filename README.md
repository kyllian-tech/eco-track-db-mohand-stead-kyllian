# EcoTrack API

**API REST production-ready** pour la gestion intelligente des déchets urbains.  
Node.js 20 · Express 5 · Supabase · Kafka · Kubernetes

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitLab-orange)](https://gitlab.com/ecotrack/ecotrack-api)
[![OpenAPI](https://img.shields.io/badge/API-OpenAPI%203.0-green)](docs/api/openapi.yaml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

---

## Fonctionnalités

- **Authentification JWT** (access 15min + refresh 7j, rotation automatique)
- **RBAC** (admin, gestionnaire, agent, citoyen, analyst)
- **16 modules métier** : conteneurs, zones, mesures IoT, signalements, tournées, gamification, notifications, support…
- **Pipeline événementiel Kafka** pour données IoT temps réel (2 000 capteurs)
- **Monitoring** : `/metrics` Prometheus, health probes K8s liveness/readiness, tracing distribué OpenTelemetry
- **Sécurité** : CSP, HSTS, rate limiting distribué, compression gzip/brotli, audit logs
- **DevOps** : Dockerfile multi-stage, CI/CD 7 stages, déploiement Blue/Green, Helm chart, HPA K8s

---

## Démarrage Rapide

### Prérequis
- Node.js ≥ 20
- Compte Supabase (base de données gérée)

```bash
# 1. Cloner le dépôt
git clone https://gitlab.com/ecotrack/ecotrack-api.git
cd ecotrack-api/ecotrack_final

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos credentials Supabase et JWT secrets

# 4. Démarrer en mode développement
npm run dev
# → API disponible sur http://localhost:3000
```

### Avec Docker Compose

```bash
docker-compose up --build
# API     → http://localhost:3000
# Grafana → http://localhost:3001 (admin/admin)
```

---

## Structure du Projet

```
ecotrack_final/
├── src/
│   ├── app.js                    # Configuration Express (middlewares, routes)
│   ├── server.js                 # Point d'entrée
│   ├── kafka/                    # Producers/consumers Kafka (M8.x)
│   │   ├── config.js             # Topics et configuration
│   │   ├── producer.js           # IoT measurements producer
│   │   └── consumer.js           # Analytics aggregation consumer
│   ├── middleware/               # Auth, RBAC, rate-limit, CSP, compression, metrics
│   ├── modules/                  # 16 modules métier (MVC : controller/service/repository)
│   │   ├── auth/                 # JWT + refresh tokens
│   │   ├── health/               # K8s probes (live/ready)
│   │   ├── metrics/              # Endpoint /metrics Prometheus
│   │   ├── containers/           # CRUD conteneurs
│   │   ├── measurements/         # Mesures IoT
│   │   ├── signalement/          # Signalements citoyens
│   │   ├── zones/                # Zones géographiques
│   │   ├── routes/               # Tournées collecte
│   │   ├── badges/               # Système de badges
│   │   └── ...                   # 7 autres modules
│   └── utils/                    # JWT, logger, audit, tracing, password, errors
├── k8s/                          # Manifests Kubernetes (M9.5)
│   ├── deployment.yaml           # Blue/Green deployments
│   ├── service.yaml, ingress.yaml
│   ├── hpa.yaml                  # Horizontal Pod Autoscaler
│   ├── network-policy.yaml       # Zero Trust isolation (M4.11)
│   └── pdb.yaml
├── helm/ecotrack-api/            # Helm chart (M9.6)
├── infrastructure/
│   ├── terraform/                # IaC AWS/EKS/RDS (M4.7, M9.2)
│   ├── vault/                    # Secrets management (M4.8)
│   └── prometheus/               # Alerting rules (M13.4)
├── tests/
│   ├── load/                     # K6 smoke + stress tests (M10.2)
│   └── security/                 # OWASP ZAP config (M10.3)
├── docs/
│   ├── api/openapi.yaml          # Spec OpenAPI 3.0 complète (M14.1)
│   ├── architecture/             # Diagrammes C4 + Kafka (M14.3)
│   ├── runbooks/                 # Procédures opérationnelles (M14.5)
│   └── security/                 # PSSI, PIA RGPD, cartographie risques (M6.x)
├── .gitlab-ci.yml               # Pipeline CI/CD 7 stages (M9.1)
├── Dockerfile                    # Multi-stage optimisé <200MB (M9.4)
├── docker-compose.yml
├── .env.example
└── .stryker.config.js            # Mutation testing (M10.4)
```

---

## API — Endpoints Principaux

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/register` | Créer un compte | Non |
| POST | `/api/auth/login` | Connexion → JWT + refresh | Non |
| POST | `/api/auth/refresh` | Renouveler le token | Non |
| GET | `/api/containers` | Lister les conteneurs | JWT |
| POST | `/api/measurements` | Enregistrer une mesure IoT | JWT |
| POST | `/api/signalement` | Signalement citoyen | JWT |
| GET | `/api/zones` | Lister les zones | JWT |
| GET | `/api/badges` | Badges disponibles | JWT |
| GET | `/health/live` | Liveness probe K8s | Non |
| GET | `/health/ready` | Readiness probe K8s | Non |
| GET | `/metrics` | Métriques Prometheus | Non |

Spec complète : [docs/api/openapi.yaml](docs/api/openapi.yaml)

---

## Scripts

```bash
npm start            # Démarrer en production
npm run dev          # Démarrer avec rechargement automatique
npm test             # Tests unitaires + intégration
npm run test:coverage # Tests avec rapport de couverture
```

---

## Tests

```bash
# Tests unitaires
npm test

# Tests de charge (K6)
k6 run tests/load/k6-smoke.js

# Tests sécurité (OWASP ZAP)
docker run --rm -v $(pwd):/zap/wrk zaproxy/zap-stable:latest \
  zap-baseline.py -t http://localhost:3000 -r /zap/wrk/zap-report.html

# Mutation testing
npx stryker run
```

---

## Déploiement Kubernetes

```bash
# Via kubectl
kubectl apply -f k8s/ -n ecotrack-prod

# Via Helm
helm install ecotrack-api helm/ecotrack-api/ \
  --namespace ecotrack-prod \
  --values helm/ecotrack-api/values.yaml
```

Voir [docs/deployment.md](docs/deployment.md) pour le guide complet incluant Terraform, Blue/Green et DR.

---

## Monitoring

Une fois déployé, accéder à :
- **Prometheus** : `http://prometheus:9090`
- **Grafana** : `http://grafana:3000` (tableaux de bord préconfigurés)
- **Kibanal** : `http://kibana:5601` (logs centralisés)
- **Metrics endpoint** : `http://api:3000/metrics`

---

## Sécurité

- [PSSI](docs/security/pssi.md) — Politique de Sécurité des SI
- [PIA RGPD](docs/security/pia-rgpd.md) — Analyse d'impact données personnelles
- [Cartographie des risques](docs/security/risk-mapping.md)
- Signaler une vulnérabilité : `security@ecotrack.com`

---

## Architecture

- [Diagrammes C4](docs/architecture/c4-architecture.md)
- [Architecture Kafka](docs/architecture/kafka-architecture.md)

---

## Rôles

| Rôle | Droits |
|------|--------|
| `admin` | Accès complet |
| `gestionnaire` | Zones, conteneurs, tournées, rapports |
| `agent` | Tournées assignées, mesures |
| `citoyen` | Signalements, gamification |
| `analyst` | Lecture seule, analytics |

---

## Auteurs

**Mohand · Stead · Kyllian** — Master 1 Informatique, 2026
