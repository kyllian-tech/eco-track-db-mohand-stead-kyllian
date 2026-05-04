# Analyse d'Impact sur la Protection des Données (AIPD/PIA) — EcoTrack

**Référence :** RGPD Art. 35 — PIA obligatoire (traitement à grande échelle de données de localisation)  
**Version :** 1.0 | **Date :** Mai 2026  
**Auteur :** DPO EcoTrack

---

## 1. Description du Traitement

| Champ | Valeur |
|-------|--------|
| **Finalité principale** | Optimisation de la collecte des déchets via géolocalisation des conteneurs et engagement citoyen |
| **Base légale** | Art. 6(1)(e) RGPD — Mission d'intérêt public / Art. 6(1)(a) pour la gamification (consentement) |
| **Catégories de personnes** | Citoyens (signalements), Agents de collecte (tournées), Gestionnaires |
| **Volume estimé** | ~50 000 citoyens, 500 agents, 2 000 capteurs IoT |
| **Données traitées** | Email, localisation GPS (signalements), historique d'actions, points gamification |
| **Durée de conservation** | Signalements : 3 ans / Données de gamification : durée du compte + 1 an |
| **Transferts hors UE** | Supabase (AWS eu-west-3) — pas de transfert hors UE |

---

## 2. Flux de Données

```
Citoyen (App Mobile)
        │ signalement + position GPS
        ▼
API EcoTrack (TLS 1.3)
        │ pseudonymisation user_id → UUID
        ▼
Supabase PostgreSQL (eu-west-3, chiffré AES-256)
        │ données agrégées anonymisées
        ▼
Dashboard Gestionnaire (accès RBAC)
```

---

## 3. Risques Identifiés et Mesures de Mitigation

| N° | Risque | Gravité | Probabilité | Score Résiduel | Mesure de mitigation |
|----|--------|---------|-------------|----------------|----------------------|
| R1 | Fuite de données email + localisation | Élevée | Faible | **Faible** | Chiffrement AES-256, accès RBAC strict |
| R2 | Ré-identification via historique de localisation | Élevée | Moyenne | **Modéré** | Pseudonymisation, agrégation spatiale avant export |
| R3 | Accès non autorisé à l'API | Élevée | Faible | **Faible** | JWT 15min, rate limiting, WAF |
| R4 | Violation de confidentialité agent (tournées) | Moyenne | Faible | **Faible** | RBAC : agents ne voient que leurs tournées |
| R5 | Rétention excessive des données | Moyenne | Moyenne | **Faible** | Politique de purge automatique (cron) |

---

## 4. Mesures de Mitigation Implémentées

### M1 — Pseudonymisation
- L'identifiant utilisateur dans les signalements est remplacé par un UUID opaque (non lié à l'email en base)
- Les données analytics ne contiennent pas de données directement identifiantes

### M2 — Minimisation des Données
- L'API ne collecte que les données strictement nécessaires à la finalité
- La localisation GPS n'est collectée qu'avec le consentement explicite du citoyen
- Pas de tracking de localisation en continu (uniquement lors d'un signalement)

### M3 — Droit à l'Effacement
- Endpoint `DELETE /api/profiles/{id}` implémenté (anonymisation cascade)
- Délai de traitement : 30 jours (traçabilité conservée sous forme anonymisée)

### M4 — Sécurité en Transit et au Repos
- TLS 1.3 obligatoire pour toutes les communications
- Chiffrement PostgreSQL (pgcrypto + KMS)
- Tokens d'accès à courte durée de vie (15 min)

### M5 — Registre des Traitements (Art. 30 RGPD)
Tenu par le DPO dans un document séparé (`docs/security/registre-traitements.md`).

---

## 5. Validation de la Base Légale

| Traitement | Base légale | Justification |
|------------|-------------|---------------|
| Signalements citoyens | Art. 6(1)(e) — intérêt public | Service public de gestion des déchets |
| Gamification (points) | Art. 6(1)(a) — consentement | Opt-in lors de l'inscription |
| Localisation agents | Art. 6(1)(b) — contrat | Nécessaire à l'exécution du contrat de travail |
| Analytics agrégées | Art. 6(1)(e) — intérêt public | Données anonymisées, hors RGPD |

---

## 6. Conclusion et Avis

Le traitement EcoTrack présente des risques **modérés** pour les droits et libertés des personnes physiques, principalement liés au traitement de données de localisation. Les mesures techniques (chiffrement, pseudonymisation, minimisation, RBAC) et organisationnelles (PSSI, formation équipe) réduisent ces risques à un niveau **acceptable**.

**Aucune consultation de la CNIL n'est requise** (risque résiduel non élevé après mitigation).

*Validé par le DPO EcoTrack — Mai 2026*
