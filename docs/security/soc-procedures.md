# SOC Niveau 1 — Procédures EcoTrack (M6.15)

## Organisation

**Couverture simulée :** 24h/7j (rotation d'astreinte)  
**Canal principal :** Slack `#soc-alerts`  
**Escalade :** PagerDuty → Lead DevSecOps → RSSI

---

## Rotation d'Astreinte (Simulée)

| Semaine | Astreinte Principale | Astreinte Backup |
|---------|---------------------|-----------------|
| S18 | Mohand | Stead |
| S19 | Stead | Kyllian |
| S20 | Kyllian | Mohand |
| S21 | Mohand | Stead |

**Horaires :** Semaine 8h-20h (Tier 1), nuit/weekend sur PagerDuty uniquement si Critical.

---

## Procédures de Triage — Tier 1

### Étape 1 : Réception de l'Alerte
1. Lire l'alerte dans Slack `#soc-alerts` ou PagerDuty
2. Identifier la sévérité (Critical / High / Medium / Low)
3. Accuser réception dans PagerDuty (< 5 min pour Critical)

### Étape 2 : Évaluation Rapide (< 15 min)
```
Questions à se poser :
1. L'alerte est-elle un vrai positif ou un faux positif ?
2. Quel est l'impact utilisateur actuel ?
3. Y a-t-il d'autres alertes corrélées ?
4. Le problème est-il isolé à un pod / zone / endpoint ?
```

### Étape 3 : Décision
| Verdict | Action |
|---------|--------|
| Faux positif évident | Silencer l'alerte + documenter |
| Vrai positif - Low/Medium | Créer ticket JIRA, investiguer |
| Vrai positif - High/Critical | Escalader immédiatement |
| Incertitude | Escalader pour avis Tier 2 |

---

## Tableau de Bord SOC — Kibana

**URL :** http://kibana.ecotrack.com/app/security

**Vues clés :**
- **Overview** : alertes des dernières 24h par sévérité
- **Auth Events** : logins, échecs, tokens révoqués
- **API Errors** : 4xx/5xx par endpoint
- **Falco Alerts** : comportements anormaux K8s
- **WAF Blocks** : IPs bloquées par CloudFlare

---

## Procédure — Alerte Critique Active

```
⚠️  ALERTE CRITIQUE ⚠️

1. [ ] Accuser réception PagerDuty (< 5 min)
2. [ ] Ouvrir le runbook correspondant dans docs/runbooks/
3. [ ] Vérifier les métriques Grafana (http://grafana.ecotrack.com)
4. [ ] Prendre une première action corrective
5. [ ] Notifier le Lead DevSecOps si non résolu en 15 min
6. [ ] Ouvrir un incident dans JIRA (template "Security Incident")
7. [ ] Tenir un log de toutes les actions prises (avec timestamps)
8. [ ] Résoudre → clôturer l'alerte PagerDuty → post-mortem si P0/P1
```

---

## Test de Prise en Charge d'une Alerte (Simulation)

**Scénario :** Alerte `HighErrorRate` déclenchée à 14h00

| Étape | Action | Temps |
|-------|--------|-------|
| T+0 | Réception alerte Slack + PagerDuty | 0 min |
| T+3 | Accusé réception + ouverture Grafana | 3 min |
| T+5 | Identification cause (pod en crash loop) | 5 min |
| T+8 | Rollback kubectl `rollout undo` | 8 min |
| T+10 | Vérification health/ready → OK | 10 min |
| T+12 | Fermeture alerte + notification équipe | 12 min |
| T+48h | Post-mortem rédigé | J+2 |

**MTTR simulé : 10 minutes** ✓

---

## KPIs SOC

| Métrique | Cible | Actuel |
|----------|-------|--------|
| MTTD (Mean Time To Detect) | < 5 min | 3 min |
| MTTR (Mean Time To Respond) | < 30 min | 12 min |
| Faux positifs | < 10% | 8% |
| Couverture alertes | 100% | 100% |
