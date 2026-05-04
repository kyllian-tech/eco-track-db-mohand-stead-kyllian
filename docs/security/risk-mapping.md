# Cartographie des Risques — EcoTrack (EBIOS RM / ISO 27005)

**Version :** 1.0 | **Date :** Mai 2026 | **Méthode :** EBIOS Risk Manager

---

## Matrice de Criticité

**Gravité** : 1 (négligeable) → 4 (critique)  
**Probabilité** : 1 (rare) → 4 (quasi-certain)  
**Score** = Gravité × Probabilité

| Score | Niveau | Action |
|-------|--------|--------|
| 1-4 | Faible | Accepter |
| 5-8 | Modéré | Surveiller |
| 9-12 | Élevé | Réduire |
| 13-16 | Critique | Traiter en urgence |

---

## Cartographie des 10 Risques Principaux

| ID | Scénario de Menace | Bien Support | Gravité | Probabilité | Score Brut | Mesures | Score Résiduel |
|----|-------------------|--------------|---------|-------------|-----------|---------|----------------|
| R01 | **Compromission JWT Secret** — Attaquant récupère la clé JWT et forge des tokens admin | JWT Secret (Vault) | 4 | 2 | **8 Modéré** | Vault + rotation 90j + clé 256-bit | **2 Faible** |
| R02 | **Injection SQL via API signalement** — Payload malveillant dans description | PostgreSQL (Supabase) | 4 | 2 | **8 Modéré** | Supabase SDK (parameterized queries) + Zod validation | **2 Faible** |
| R03 | **DDoS sur endpoint /api/auth/login** — Saturation par force brute distribuée | API EcoTrack | 3 | 3 | **9 Élevé** | Rate limiting (5 req/15min/IP) + WAF CloudFlare + CAPTCHA | **3 Modéré** |
| R04 | **Fuite de données S3 (Terraform State)** — Bucket public exposant credentials | tfstate S3 | 4 | 2 | **8 Modéré** | Bucket privé + chiffrement KMS + versioning | **2 Faible** |
| R05 | **Accès non autorisé données IoT** — Agent accédant aux données d'autres zones | PostgreSQL | 3 | 2 | **6 Modéré** | RBAC zone-based + RLS Supabase | **2 Faible** |
| R06 | **Pod escape dans Kubernetes** — Container breakout vers le nœud hôte | Cluster K8s | 4 | 1 | **4 Faible** | seccompProfile + readOnlyRootFilesystem + Falco IDS | **1 Faible** |
| R07 | **Interception communication Kafka** — MITM sur topic iot.measurements | Kafka MSK | 3 | 2 | **6 Modéré** | TLS 1.3 + SASL/SCRAM-512 + ACLs | **2 Faible** |
| R08 | **Exfiltration données citoyens** — Dump de la table signalements | PostgreSQL | 4 | 2 | **8 Modéré** | Chiffrement colonne (pgcrypto) + monitoring accès + alertes SIEM | **3 Modéré** |
| R09 | **Supply chain attack** — Dépendance npm compromise | node_modules | 4 | 2 | **8 Modéré** | npm audit CI + Snyk + Dependabot + lock files | **4 Modéré** |
| R10 | **Perte de données RDS** — Corruption ou suppression accidentelle | PostgreSQL RDS | 4 | 1 | **4 Faible** | Backups automatiques 30j + PITR + réplication multi-AZ | **1 Faible** |

---

## Détail des 5 Mesures de Réduction Prioritaires

### MR1 — Zero Trust réseau (Network Policies K8s)
- **Cible :** R03, R05, R06
- **Implémentation :** `k8s/network-policy.yaml` — deny-all par défaut, allowlists explicites
- **Validation :** `kubectl exec` depuis pod non autorisé → connexion refusée

### MR2 — Secrets dynamiques Vault (rotation automatique)
- **Cible :** R01, R04
- **Implémentation :** HashiCorp Vault kv-v2 + External Secrets Operator
- **Validation :** `vault kv get secret/ecotrack/api/jwt` après rotation → nouveau secret

### MR3 — Validation stricte des entrées (Zod + Supabase SDK)
- **Cible :** R02
- **Implémentation :** `src/middleware/validation.middleware.js` — tous les endpoints validés
- **Validation :** Test SQLMap → 0 injection détectée

### MR4 — Chiffrement at-rest complet
- **Cible :** R08, R10
- **Implémentation :** AWS KMS + pgcrypto pour PII + RDS encryption
- **Validation :** Dump de volume EBS chiffré → données illisibles

### MR5 — Surveillance comportementale (Falco + SIEM)
- **Cible :** R05, R06, R08
- **Implémentation :** Falco rules + ELK SIEM + alertes Alertmanager
- **Validation :** Simulation shell dans pod → alerte levée en < 30s

---

## Risque Résiduel Global

Après application des mesures : **risque résiduel MODÉRÉ** — acceptable pour un déploiement production.  
Révision planifiée : semestrielle ou après incident significatif.
