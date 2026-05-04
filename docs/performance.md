# Performance ECOTRACK API

## Optimisations intégrées

### Clustering PM2

Le fichier `ecosystem.config.js` permet d'exécuter l'API en mode cluster sur tous les coeurs disponibles.

### Rate limiting

Le limiteur protège l'API contre les abus et stabilise les ressources.

### Cache

Un service de cache est fourni dans `src/services/cache.service.js`. Il fonctionne en mémoire et peut être remplacé par Redis sans toucher à la couche métier.

### Logging

Les logs structurés permettent de mesurer les temps de réponse et de détecter rapidement les ralentissements.

## Commandes de benchmark proposées

### Sans PM2

```bash
ab -n 500 -c 50 http://localhost:3000/health
```

### Avec PM2 cluster

```bash
pm2 start ecosystem.config.js
ab -n 500 -c 50 http://localhost:3000/health
```

## Résultats attendus dans le rapport

- throughput avant / après cluster
- latence moyenne avant / après cache
- comportement des endpoints de santé
