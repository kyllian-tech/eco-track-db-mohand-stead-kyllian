# Runbook — High Error Rate (5xx)

**Alerte :** `HighErrorRate`  
**Sévérité :** Critical  
**SLO impacté :** Disponibilité et taux d'erreur  
**Temps de réponse cible :** < 15 min

---

## Symptômes

- Alerte Prometheus : `rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.01`
- Dashboard Grafana : taux d'erreur > 1%
- Clients signalent des erreurs 500/503

---

## Impact

- **Utilisateurs affectés :** Tous les utilisateurs actifs
- **Fonctionnalités dégradées :** API complète ou partielle
- **Consommation error budget :** Proportionnelle à la durée

---

## Diagnostic (dans l'ordre)

### Étape 1 — Identifier les pods problématiques
```bash
kubectl get pods -n ecotrack-prod -l app=ecotrack-api
kubectl describe pod <pod-name> -n ecotrack-prod
kubectl logs <pod-name> -n ecotrack-prod --tail=100
```

### Étape 2 — Vérifier les erreurs récentes
```bash
# Via Kibana : requête logs des 15 dernières minutes
# index: ecotrack-* | level:error | @timestamp:[now-15m TO now]

# Via kubectl logs
kubectl logs -n ecotrack-prod -l app=ecotrack-api --since=15m | grep '"level":"error"' | jq .
```

### Étape 3 — Vérifier la base de données
```bash
kubectl exec -n ecotrack-prod deployment/ecotrack-api -- \
  wget -qO- http://localhost:3000/health/db | jq .
```

### Étape 4 — Vérifier Redis
```bash
kubectl exec -n ecotrack-prod deployment/ecotrack-api -- \
  wget -qO- http://localhost:3000/health/redis | jq .
```

### Étape 5 — Vérifier les dépendances externes (Supabase)
```bash
curl -s https://status.supabase.com/api/v2/status.json | jq '.status.description'
```

---

## Résolution

### Cas 1 — Erreur applicative (bug code)
```bash
# Rollback vers la version précédente (Blue/Green)
CURRENT=$(kubectl get svc ecotrack-api -n ecotrack-prod -o jsonpath='{.spec.selector.color}')
OLD=$([ "$CURRENT" = "blue" ] && echo "green" || echo "blue")
kubectl patch svc ecotrack-api -n ecotrack-prod \
  -p "{\"spec\":{\"selector\":{\"color\":\"$OLD\"}}}"
echo "Traffic shifted back to $OLD"
```

### Cas 2 — Surcharge (OOM / CPU)
```bash
# Scale out
kubectl scale deployment/ecotrack-api-blue --replicas=6 -n ecotrack-prod
# Attendre que les pods soient prêts
kubectl rollout status deployment/ecotrack-api-blue -n ecotrack-prod
```

### Cas 3 — Base de données indisponible
```bash
# Activer le mode maintenance (503 clair pour les clients)
kubectl set env deployment/ecotrack-api-blue MAINTENANCE_MODE=true -n ecotrack-prod
# Notifier les utilisateurs via page de statut
```

### Cas 4 — Crash loop
```bash
kubectl rollout undo deployment/ecotrack-api-blue -n ecotrack-prod
kubectl rollout status deployment/ecotrack-api-blue -n ecotrack-prod
```

---

## Prévention

- **Smoke tests** post-déploiement : K6 smoke test dans le pipeline CI/CD
- **HPA** : scale automatique si CPU > 70%
- **PDB** : maintient au minimum 2 pods disponibles

---

## Post-mortem

Après résolution, créer un post-mortem dans `docs/post-mortems/` :
- Timeline des événements
- Root cause analysis
- Actions préventives (avec assignés et délais)
