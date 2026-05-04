# Architecture MLOps — EcoTrack

## Vue d'Ensemble

EcoTrack utilise un pipeline MLOps pour prédire le taux de remplissage des conteneurs à 24h, permettant d'optimiser les tournées de collecte (-20% km parcourus objectif).

---

## M7.1 — Infrastructure MLOps (MLflow + Kubeflow)

```
┌────────────────────────────────────────────────────────────────┐
│                    MLOPS PIPELINE ECOTRACK                     │
├──────────────┬─────────────────┬──────────────┬───────────────┤
│  DATA LAYER  │   TRAIN LAYER   │  SERVE LAYER │  MONITOR LAYER│
│              │                 │              │               │
│ Feature Store│ MLflow Tracking │ FastAPI      │ Evidently AI  │
│ (Redis+PG)   │ Kubeflow Train  │ Seldon Core  │ (Data Drift)  │
│              │ Pipeline        │ (Canary)     │               │
│ DVC (M7.10)  │                 │              │ Grafana ML    │
│ (data ver.)  │ GPU Training    │ Shadow Model │ Dashboards    │
└──────────────┴─────────────────┴──────────────┴───────────────┘
```

## M7.2 — Feature Store (5 Caractéristiques Clés)

| Feature | Description | Latence | Source |
|---------|-------------|---------|--------|
| `avg_fill_7d` | Moyenne remplissage 7 derniers jours | < 10ms | Redis |
| `fill_velocity` | Vitesse de remplissage (% / heure) | < 10ms | Redis |
| `zone_activity_score` | Score d'activité de la zone | < 20ms | PostgreSQL |
| `day_of_week` | Jour de la semaine (encodé) | < 1ms | Computed |
| `hour_of_day` | Heure de la journée | < 1ms | Computed |

**Latence d'accès cible :** < 50ms (SLO M7.2)

## M7.4 — API d'Inférence Sécurisée

- **Endpoint :** `POST /api/ml/predict`
- **Auth :** JWT (rôles admin, gestionnaire, analyst)
- **Latence cible :** < 200ms (P95)
- **Auto-scaling :** HPA basé sur CPU + métriques custom Prometheus

## M7.5 — Stratégie Canary pour le Modèle

```yaml
# Istio VirtualService pour déploiement Canary
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ml-inference
spec:
  http:
    - route:
        - destination:
            host: ml-inference-v1  # Modèle stable
          weight: 90
        - destination:
            host: ml-inference-v2  # Nouveau modèle (canary)
          weight: 10
```

## M7.6 — Retrain Automatisé

**Déclencheurs :**
1. Dérive de données détectée (> 10% drift score)
2. Accuracy < 90% sur le golden set
3. CronJob hebdomadaire (dimanche 2h00)

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: ml-retrain
spec:
  schedule: "0 2 * * 0"  # Dimanche 2h
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: trainer
            image: registry.gitlab.com/ecotrack/ml-trainer:latest
            env:
            - name: MLFLOW_TRACKING_URI
              value: http://mlflow:5000
```

## M7.8 — KPIs Métier du Modèle (5 KPIs)

| KPI | Cible | Alerte si |
|-----|-------|-----------|
| Accuracy (RMSE fill level) | < 5% | > 10% |
| Precision overflow alert | > 90% | < 85% |
| Recall overflow alert | > 85% | < 80% |
| Latence inférence P95 | < 200ms | > 500ms |
| Tours optimisées / semaine | > 80% | < 70% |

## M7.9 — Shadow Model

Le Shadow Model reçoit une copie du trafic de production pour comparer ses prédictions sans impact client :

```
Client → ML Inference V1 (prod) → Réponse client
              ↓ (copie asynchrone)
         ML Inference V2 (shadow) → Log uniquement
```

Comparaison quotidienne des résultats via golden set.

## M7.3 — Détection de Data Drift (Evidently AI)

Seuils d'alerte : drift score > 0.10 sur une feature → Warning  
Action automatique : déclencher un retrain + notifier l'équipe ML

## M7.10 — Versioning des Données (DVC)

```bash
# Enregistrer une nouvelle version du dataset
dvc add data/measurements_2026_q2.parquet
git add data/measurements_2026_q2.parquet.dvc
git commit -m "feat(ml): add Q2 2026 training dataset"
dvc push

# Récupérer une version précédente
git checkout v1.1.0 -- data/measurements_2026_q1.parquet.dvc
dvc checkout
```
