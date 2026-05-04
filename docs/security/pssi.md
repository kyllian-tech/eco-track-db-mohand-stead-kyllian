# Politique de Sécurité des Systèmes d'Information (PSSI) — EcoTrack

**Version :** 1.0  
**Date :** Mai 2026  
**Classification :** Confidentiel  
**Auteurs :** Mohand, Stead, Kyllian  
**Approbation simulée :** RSSI EcoTrack

---

## 1. Introduction et Périmètre

La présente PSSI définit le cadre de sécurité applicable à l'ensemble du système d'information ECOTRACK, incluant l'API REST, les microservices IoT, les applications mobiles, l'infrastructure cloud et les données traitées.

**Périmètre couvert :**
- API REST Node.js/Express (ecotrack-api)
- Cluster Kubernetes AWS EKS (eu-west-3)
- Base de données Supabase/PostgreSQL
- Broker Kafka (Amazon MSK)
- Applications mobiles (citoyens, agents)
- Dashboard gestionnaires

**Périmètre exclu :** Systèmes tiers hors périmètre contractuel (capteurs IoT de fabricants tiers).

---

## 2. Objectifs de Sécurité

| Objectif | Cible |
|----------|-------|
| Disponibilité | 99,9% uptime mensuel (≤ 43 min downtime/mois) |
| Intégrité | Zéro corruption de données en transit ou au repos |
| Confidentialité | Accès aux données strictement limité au besoin fonctionnel |
| Traçabilité | 100% des actions critiques journalisées (rétention 1 an) |
| Non-répudiation | Signature cryptographique de tous les tokens JWT |

---

## 3. Organisation de la Sécurité

### Rôles et Responsabilités

| Rôle | Responsabilités |
|------|----------------|
| **RSSI (Responsable Sécurité SI)** | Pilotage de la PSSI, arbitrage risques, interlocuteur CNIL |
| **DPO (Délégué Protection Données)** | Conformité RGPD, registre des traitements, signalement violations |
| **Lead DevSecOps** | Sécurité du pipeline CI/CD, scans de vulnérabilités, Vault |
| **Développeurs** | Application des standards de code sécurisé (OWASP), revue de code |
| **Ops/SRE** | Monitoring, alertes, réponse aux incidents de disponibilité |

---

## 4. Classification des Données

| Niveau | Description | Exemples | Mesures |
|--------|-------------|----------|---------|
| **Public** | Données accessibles à tous | Positions conteneurs publics | Chiffrement transit HTTPS |
| **Interne** | Données opérationnelles | Statistiques de remplissage agrégées | Auth JWT requise |
| **Confidentiel** | Données personnelles citoyens | Email, localisation, historique signalements | Chiffrement + pseudonymisation |
| **Secret** | Secrets techniques | Clés JWT, credentials DB | HashiCorp Vault, rotation 90j |

---

## 5. Politique d'Authentification et d'Accès

### 5.1 Authentification
- **JWT** : Access tokens (15 min) + Refresh tokens (7 jours) avec rotation automatique
- **Complexité mots de passe** : min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
- **Verrouillage** : après 5 tentatives échouées (rate limiting IP)
- **MFA** : obligatoire pour les comptes Admin et Gestionnaire (TOTP via Google Authenticator)
- **Sessions** : révocation immédiate possible via refresh token blacklist

### 5.2 Contrôle d'Accès (RBAC)
| Rôle | Droits |
|------|--------|
| `admin` | Tous droits sur toutes les ressources |
| `gestionnaire` | Lecture/écriture zones, conteneurs, tournées, rapports |
| `agent` | Lecture tournées assignées, écriture mesures |
| `citoyen` | Lecture position conteneurs, écriture signalements |
| `analyst` | Lecture seule sur les données agrégées |

### 5.3 Principe du Moindre Privilège
- Kubernetes RBAC : chaque service account n'a accès qu'aux ressources nécessaires
- Network Policies : zero-trust, communication inter-services explicitement autorisée
- Vault policies : lecture seule sur les secrets propres au service

---

## 6. Politique de Chiffrement

| Contexte | Algorithme | Gestion des clés |
|----------|-----------|------------------|
| TLS (transit) | TLS 1.3, suites ECDHE/AES-256-GCM | Let's Encrypt, renouvellement auto |
| JWT signature | HMAC-SHA256 (HS256) | HashiCorp Vault, rotation 90j |
| Mots de passe | bcrypt (cost=12) | N/A (hash irréversible) |
| Données PII en base | pgcrypto (AES-256) | AWS KMS |
| Disques RDS/EBS | AWS KMS (AES-256) | Rotation annuelle automatique |
| Kafka (transit) | TLS 1.3 + SASL/SCRAM-512 | Certificats managés MSK |
| Redis | TLS (ElastiCache) | AWS KMS |

---

## 7. Politique de Gestion des Vulnérabilités

### 7.1 Détection
- **SCA (Software Composition Analysis)** : `npm audit` + Snyk dans chaque pipeline CI/CD
- **SAST** : Semgrep sur chaque merge request
- **DAST** : OWASP ZAP hebdomadaire sur staging
- **Container scan** : Trivy à chaque build d'image
- **Infrastructure scan** : Prowler mensuel sur l'AWS Account

### 7.2 SLA de Remédiation

| Sévérité | Délai max de correction |
|----------|------------------------|
| Critique (CVSS ≥ 9.0) | 24 heures |
| Haute (7.0 - 8.9) | 7 jours |
| Moyenne (4.0 - 6.9) | 30 jours |
| Faible (< 4.0) | Prochaine release |

---

## 8. Politique de Journalisation et Monitoring

### 8.1 Événements journalisés
- Tentatives de connexion (succès et échecs)
- Accès aux données personnelles
- Modifications de configuration ou de données critiques
- Erreurs d'autorisation (403)
- Dépassements de rate limit (429)
- Violations CSP

### 8.2 Rétention
- Logs applicatifs : 90 jours (Elasticsearch)
- Logs de sécurité (SIEM) : 12 mois
- Audit trail (base de données) : 5 ans

### 8.3 Alertes (Prometheus + Alertmanager)
- Error rate > 1% → PagerDuty (Critical)
- Latence P95 > 500ms → Slack (Warning)
- Tentative de connexion suspecte (> 10/min depuis une IP) → PagerDuty

---

## 9. Gestion des Incidents de Sécurité

### 9.1 Processus de Réponse

```
Détection → Tri (15 min) → Confinement (1h) → Éradication → Rétablissement → Post-mortem (48h)
```

### 9.2 Notification CNIL
En cas de violation de données personnelles, notification à la CNIL dans un délai de **72 heures** conformément à l'article 33 du RGPD. Voir runbook `docs/runbooks/data-breach.md`.

### 9.3 Communication de Crise
- Contact presse : PDG EcoTrack
- Contact technique : RSSI + Lead DevSecOps
- Clients affectés : email dans les 24h si données compromises

---

## 10. Conformité et Audit

### 10.1 Normes de référence
- **RGPD** (Règlement Général sur la Protection des Données)
- **OWASP Top 10** (2021)
- **CIS Kubernetes Benchmarks v1.8**
- **ISO 27001** (objectif de certification à 18 mois)
- **PCI-DSS** (non applicable — pas de traitement de paiements)

### 10.2 Audits planifiés
| Type | Fréquence | Responsable |
|------|-----------|-------------|
| Pentest externe (boîte noire) | Annuel | Prestataire externe |
| Revue de code sécurité | Trimestriel | Lead DevSecOps |
| Audit RGPD | Semestriel | DPO |
| Revue des accès (IAM) | Mensuel | RSSI |

### 10.3 Ratification
Cette PSSI est ratifiée par la direction technique d'EcoTrack et entre en vigueur le **1er mai 2026**. Elle fait l'objet d'une révision annuelle ou lors de tout changement majeur d'architecture.

*Signataire simulé : Direction Technique EcoTrack — Mai 2026*
