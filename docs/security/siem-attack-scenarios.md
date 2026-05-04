# SIEM — Scénarios de Détection d'Attaque (M6.7, M6.8)

## Architecture SIEM EcoTrack

```
Sources de logs          →    ELK SIEM           →    Alertes
─────────────────              ─────────────              ──────────
API (JSON structured) ──►  Elasticsearch ──►  Kibana/Watcher ──► PagerDuty
WAF (CloudFlare)      ──►  Logstash       ──►  Alertes SIEM   ──► Slack
K8s Audit Logs        ──►  Filebeat        ──►  SOAR Actions   ──► Email
Network Policies      ──►  (pipelines)    ──►
Falco IDS             ──►
```

## 3 Sources de Logs Critiques Agrégées

1. **Application logs** (API EcoTrack) — JSON structuré via Filebeat → Logstash → Elasticsearch
2. **K8s Audit Logs** — activés sur le control plane EKS, forwarded via Fluent Bit
3. **WAF logs** (CloudFlare) — via Logpush → S3 → Logstash

---

## 10 Scénarios de Détection d'Attaque

### SC01 — Brute Force sur /api/auth/login

| Champ | Valeur |
|-------|--------|
| **Titre** | Brute Force Authentication |
| **Déclencheur** | > 20 requêtes vers `/api/auth/login` avec status 401 depuis la même IP en 5 minutes |
| **Sévérité** | High |
| **Réponse** | Bloquer l'IP au WAF + créer ticket JIRA |

```json
// Règle Kibana Watcher
{
  "trigger": { "schedule": { "interval": "5m" } },
  "input": {
    "search": {
      "request": {
        "indices": ["ecotrack-api-*"],
        "body": {
          "query": { "bool": {
            "must": [
              { "match": { "path": "/api/auth/login" } },
              { "match": { "status": 401 } },
              { "range": { "@timestamp": { "gte": "now-5m" } } }
            ]
          }},
          "aggs": { "by_ip": { "terms": { "field": "ip", "min_doc_count": 20 } } }
        }
      }
    }
  },
  "condition": { "compare": { "ctx.payload.aggregations.by_ip.buckets": { "not_eq": [] } } },
  "actions": { "send_alert": { "webhook": { "url": "https://hooks.slack.com/..." } } }
}
```

---

### SC02 — Injection SQL Tentée

**Déclencheur :** Pattern SQL dans les champs de requête : `'; DROP TABLE`, `' OR 1=1`, `UNION SELECT`  
**Sévérité :** High  
**Source :** WAF logs + Application error logs  
**Réponse :** Bloquer l'IP, logger la payload, notifier immédiatement

---

### SC03 — Accès Massif aux Données (Exfiltration)

**Déclencheur :** Un utilisateur fait > 500 requêtes GET vers `/api/profiles` ou `/api/signalement` en 10 minutes  
**Sévérité :** Critical  
**Réponse :** Révoquer le token JWT, bloquer l'utilisateur, alerter RSSI

---

### SC04 — Pod Shell Exécution (Falco)

**Déclencheur :** Falco rule `Terminal shell in container` — `execve` vers `/bin/bash` ou `/bin/sh` dans un pod EcoTrack  
**Sévérité :** Critical  
**Réponse :** Isoler le pod (NetworkPolicy + label), capturer l'état forensique, alerter P0

```yaml
# Règle Falco
- rule: Shell Spawned in EcoTrack Container
  desc: Détecte l'ouverture d'un shell dans un pod ecotrack
  condition: >
    spawned_process and container and container.label.app = ecotrack-api
    and proc.name in (bash, sh, zsh) and not proc.pname in (node)
  output: >
    Shell spawned in ecotrack pod (pod=%k8s.pod.name user=%user.name cmd=%proc.cmdline)
  priority: CRITICAL
```

---

### SC05 — Certificat TLS Proche de l'Expiration

**Déclencheur :** `days_until_expiry < 15` pour `api.ecotrack.com`  
**Sévérité :** High  
**Réponse :** Déclencher le renouvellement cert-manager + alerte équipe

---

### SC06 — Kafka Consumer Lag Anormal

**Déclencheur :** Consumer lag > 10 000 sur `iot.measurements` pendant > 5 minutes  
**Sévérité :** Warning  
**Réponse :** Scale-out automatique KEDA + alerte équipe

---

### SC07 — Erreur Rate Spike (DoS potentiel)

**Déclencheur :** Error rate > 10% sur 2 minutes  
**Sévérité :** Critical  
**Réponse :** Activer la protection DDoS CloudFlare + pager on-call

---

### SC08 — Accès Privilège Escalation K8s

**Déclencheur :** `kubectl exec` ou `kubectl port-forward` depuis un compte hors whitelist dans les K8s audit logs  
**Sévérité :** High  
**Réponse :** Révoquer les credentials, notifier RSSI

---

### SC09 — Violation CSP Répétée

**Déclencheur :** > 50 violations CSP depuis la même IP en 5 minutes  
**Sévérité :** Medium  
**Réponse :** Investigation — peut indiquer une tentative XSS

---

### SC10 — Modification IaC Non Auditée (Drift Detection, M4.14)

**Déclencheur :** `terraform plan` détecte une différence entre l'état réel et le state Terraform  
**Sévérité :** High  
**Réponse :** Drift report → PR Git obligatoire pour corriger + alerte équipe DevOps

---

## 5 Règles de Corrélation Automatique

| Règle | Condition | Action |
|-------|-----------|--------|
| Brute Force → IP Block | SC01 déclenché | CloudFlare API: block IP 24h |
| Critical Falco + API errors | SC04 + SC07 simultanés | Page P0 + isoler pod |
| SQL Injection + 200 status | SC02 + status=200 | P0 — injection réussie possible |
| Drift + Accès K8s | SC10 + SC08 dans 1h | P0 — compromission infrastructure |
| Consumer Lag + No Measurements | SC06 + absence de données 30min | P1 — pipeline IoT cassé |

---

## Test de Déclenchement d'une Règle

```bash
# Test SC01 — simuler brute force (depuis environnement de test uniquement)
for i in $(seq 1 25); do
  curl -s -X POST http://api.staging.ecotrack.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"victim@test.com","password":"wrong'$i'"}' &
done

# Vérifier dans Kibana que l'alerte SC01 a été levée
# → Dashboard: SIEM Alerts → Filter: rule_id=SC01
```
