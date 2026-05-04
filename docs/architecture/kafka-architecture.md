# Architecture Événementielle EcoTrack — Kafka 3.5

## Vue d'ensemble

EcoTrack adopte une architecture **event-driven** basée sur Kafka 3.5 pour gérer le pipeline de données IoT en temps réel (2 000+ capteurs), la traçabilité des tournées et l'engagement citoyen.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ECOTRACK EVENT ARCHITECTURE                         │
├─────────────────┬───────────────────────────────┬───────────────────────────┤
│   PRODUCERS     │         KAFKA CLUSTER          │       CONSUMERS           │
│                 │    (3 brokers, Kraft mode)     │                           │
│  IoT Sensors    │                                │  Analytics Aggregator     │
│  (MQTT Gateway) ├──► iot.measurements ──────────►  (Node.js + PostgreSQL)   │
│                 │    [12 partitions, 7j]         │                           │
│  EcoTrack API  ├──► container.events ─────────► Container State Service    │
│  (Signalement)  │    [6 partitions, 30j]         │                           │
│                 ├──► signalement.events ────────► Notification Service      │
│  EcoTrack API  │    [4 partitions, 30j]         │                           │
│  (Tournées)     ├──► tournee.events ────────────► Route Optimizer           │
│                 │    [6 partitions, 90j]         │  (Event Sourcing)         │
│  EcoTrack API  ├──► gamification.events ────────► Leaderboard Service      │
│  (Gamification) │    [4 partitions, 90j]         │                           │
│                 ├──► notifications ─────────────► Push Notification Worker  │
│  All services   │    [4 partitions, 1j]          │  (FCM/APNS)               │
│                 ├──► audit.logs ─────────────────► ELK SIEM                 │
│                 │    [4 partitions, 365j]         │                           │
│                 ├──► dead-letter-queue ──────────► DLQ Processor            │
│                 │    [2 partitions, 30j]          │                           │
└─────────────────┴───────────────────────────────┴───────────────────────────┘
```

## Justification du Choix Kafka (ADR)

**Décision :** Kafka 3.5 (Amazon MSK) vs alternatives (RabbitMQ, Redis Streams, Pulsar)

| Critère | Kafka | RabbitMQ | Redis Streams | Pulsar |
|---------|-------|----------|---------------|--------|
| Throughput | **>1M msg/s** | ~50K msg/s | ~100K msg/s | >1M msg/s |
| Rétention longue | **Oui (configurable)** | Non (AMQP) | Limité RAM | Oui |
| Event Sourcing | **Natif** | Partiel | Non | Oui |
| Maturité écosystème | **Excellent** | Bon | Moyen | Moyen |
| Support Kubernetes | **MSK + Strimzi** | Bon | Bon | Moyen |
| Complexité opérationnelle | Élevée | Modérée | Faible | Élevée |

**Choix : Kafka** — seule solution capable d'absorber le débit de 2 000 capteurs (1 msg/30s = 3 600 msg/min) avec rétention longue pour l'event sourcing des tournées et la conformité d'audit 1 an.

## Spécification des 8 Topics Principaux

### `iot.measurements`
- **Producteur :** IoT Gateway (MQTT → Kafka bridge)
- **Consommateurs :** Analytics Aggregator, Alert Service, ML Feature Store
- **Partitionnement :** `container_id` (répartition uniforme par zone)
- **Rétention :** 7 jours (données brutes remplacées par agrégats)
- **Compression :** lz4 (réduction ~60% de l'espace disque)
- **Schema Avro :** `ContainerMeasurementV1`

```json
{
  "event_type": "iot.measurement.received",
  "container_id": "uuid",
  "fill_level": 75.5,
  "battery_level": 88,
  "sensor_id": "SENSOR-001",
  "measured_at": "2026-05-03T10:00:00Z",
  "schema_version": "1.0"
}
```

### `tournee.events` (Event Sourcing)
- **Pattern :** Event Sourcing + Snapshots
- **Events :** `TourneeCreated`, `TourneeStarted`, `ContainerVisited`, `TourneeCompleted`, `TourneeCancelled`
- **Rétention :** 90 jours (historique complet des tournées)
- **Snapshots :** Topic séparé `tournee.snapshots` (après 50 events)

## Monitoring Kafka (M8.9)

**Métriques clés surveillées :**
- `kafka_server_brokertopicmetrics_messagesin_total` — throughput entrant
- `kafka_consumer_consumer_fetch_manager_metrics_records_lag_max` — consumer lag
- `kafka_controller_kafkacontroller_activecontrollercount` — HA controller
- `kafka_server_replicamanager_underreplicatedpartitions` — partitions sous-répliquées

**Alertes configurées :**
- Consumer lag > 1 000 messages : Warning
- Consumer lag > 10 000 messages : Critical
- Partition sous-répliquée > 0 : Critical
- Broker down : Critical

## Sécurité Kafka (M8.10)

- **Encryption transit :** TLS 1.3 sur tous les listeners
- **Authentification :** SASL/SCRAM-512 avec credentials dans Vault
- **Autorisation :** ACLs par topic et consumer group
- **Encryption at-rest :** LUKS sur les volumes EBS des brokers (AWS MSK)
- **Rotation certificats :** Automatique via cert-manager (90 jours)
