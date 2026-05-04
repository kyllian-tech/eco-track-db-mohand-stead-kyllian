# Runbook — Kafka Consumer Lag Élevé

**Alerte :** `KafkaConsumerLagHigh`  
**Sévérité :** Warning → Critical si lag > 10 000 messages  
**Impact :** Retard dans le traitement des mesures IoT, alertes en retard

---

## Symptômes

- Dashboard Grafana : consumer lag croissant sur `iot.measurements`
- Alertes de conteneurs pleins non envoyées dans les délais
- Alerte KEDA n'a pas déclenché de scale-up

---

## Diagnostic

```bash
# Via kafka-consumer-groups.sh (depuis un pod kafka)
kafka-consumer-groups.sh \
  --bootstrap-server kafka:9092 \
  --describe --group ecotrack-consumers

# Vérifier l'état du consumer pod
kubectl get pods -n ecotrack-prod -l app=ecotrack-measurements-worker
kubectl logs -n ecotrack-prod -l app=ecotrack-measurements-worker --tail=50

# Vérifier les métriques Prometheus
# PromQL: kafka_consumergroup_lag{consumergroup="ecotrack-consumers",topic="iot.measurements"}
```

---

## Résolution

### Cas 1 — Consumer trop lent (processing time élevé)
```bash
# Scale out les workers
kubectl scale deployment/ecotrack-measurements-worker \
  --replicas=5 -n ecotrack-prod

# Vérifier que KEDA ScaledObject fonctionne
kubectl describe scaledobject ecotrack-measurements-consumer -n ecotrack-prod
```

### Cas 2 — Consumer crashé
```bash
kubectl rollout restart deployment/ecotrack-measurements-worker -n ecotrack-prod
kubectl rollout status deployment/ecotrack-measurements-worker -n ecotrack-prod
```

### Cas 3 — Partitions déséquilibrées
```bash
# Réassigner les partitions
kafka-reassign-partitions.sh \
  --bootstrap-server kafka:9092 \
  --reassignment-json-file reassignment.json \
  --execute
```

### Cas 4 — Messages en DLQ (dead letter queue)
```bash
# Inspecter le DLQ
kafka-console-consumer.sh \
  --bootstrap-server kafka:9092 \
  --topic dead-letter-queue \
  --from-beginning \
  --max-messages 10

# Rejouer les messages après correction du bug
# (utiliser un outil comme kafka-reassign ou script custom)
```

---

## Prévention

- KEDA ScaledObject configuré : scale automatique si lag > 100
- Monitoring Grafana : alerte si lag > 1 000
- DLQ : messages non processables isolés pour analyse ultérieure
