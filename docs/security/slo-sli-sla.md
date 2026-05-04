# SLOs / SLIs / SLA — EcoTrack API (M13.8)

## Définitions

- **SLI (Service Level Indicator)** : métrique technique mesurée (ex: taux d'erreur)
- **SLO (Service Level Objective)** : objectif interne sur un SLI (ex: erreur < 1%)
- **SLA (Service Level Agreement)** : engagement contractuel client (ex: 99.9% uptime)
- **Error Budget** : marge de tolérance = 100% - SLO cible

---

## SLIs et SLOs Définis

| SLI | Expression PromQL | SLO Cible | SLA Client |
|-----|------------------|-----------|------------|
| **Disponibilité** | `sum(rate(http_requests_total{status!~"5.."}[5m])) / sum(rate(http_requests_total[5m]))` | 99,9% | 99,5% |
| **Latence P95** | `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) < 0.2` | < 200ms | < 500ms |
| **Taux d'erreur** | `rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])` | < 0,1% | < 0,5% |
| **Throughput** | `rate(http_requests_total[5m])` | > 100 req/s | > 50 req/s |
| **Latence inférence ML** | `histogram_quantile(0.95, rate(ml_inference_duration_seconds_bucket[5m]))` | < 200ms | < 500ms |

---

## Error Budget Mensuel

**Base :** 30 jours × 24h × 60min = 43 200 min/mois

| SLO | Cible | Downtime autorisé/mois |
|-----|-------|------------------------|
| Disponibilité 99,9% | 99,9% | **43,2 min** |
| Latence P95 < 200ms | 99,5% | **216 min** |
| Taux d'erreur < 0,1% | 99,9% | **43,2 min** |

---

## Dashboards Grafana — SLO Tracking

**Panel 1 : Disponibilité 30 jours glissants**
```promql
avg_over_time(
  (
    sum(rate(http_requests_total{status!~"5.."}[5m]))
    / sum(rate(http_requests_total[5m]))
  )[30d:5m]
)
```

**Panel 2 : Error Budget Restant**
```promql
# Budget consommé (%)
(
  1 - avg_over_time(
    (sum(rate(http_requests_total{status!~"5.."}[5m])) / sum(rate(http_requests_total[5m])))[30d:5m]
  )
) / (1 - 0.999) * 100
```

**Panel 3 : Burn Rate (vitesse de consommation du budget)**
```promql
# Burn rate sur 1h (> 14.4 = budget épuisé en < 2h si taux constant)
(
  rate(http_requests_total{status=~"5.."}[1h])
  / rate(http_requests_total[1h])
) / 0.001
```

---

## Alertes SLO (Prometheus Alertmanager)

```yaml
# Burn rate critique (> 14.4x sur 1h → budget épuisé en < 2h)
- alert: SLOBurnRateCritical
  expr: |
    (rate(http_requests_total{status=~"5.."}[1h]) / rate(http_requests_total[1h])) / 0.001 > 14.4
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "Error budget brûle trop vite — gel des déploiements"

# Burn rate élevé (> 6x sur 6h → budget épuisé en < 5 jours)
- alert: SLOBurnRateHigh
  expr: |
    (rate(http_requests_total{status=~"5.."}[6h]) / rate(http_requests_total[6h])) / 0.001 > 6
  for: 15m
  labels:
    severity: warning
```

---

## Rapport Mensuel SLO

| Mois | Dispo | Latence P95 | Taux erreur | Budget dispo. consommé | Incidents |
|------|-------|-------------|-------------|------------------------|-----------|
| Avr. 2026 | 99,94% | 145ms | 0,06% | 38% | 1 (P3) |
| Mars 2026 | 99,99% | 132ms | 0,01% | 5% | 0 |
| Fév. 2026 | 99,87% | 178ms | 0,13% | 130% ⚠️ | 2 (1xP2) |
