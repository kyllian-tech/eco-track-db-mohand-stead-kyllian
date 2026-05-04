# Architecture ECOTRACK API

## Vue d'ensemble

L'application a été réorganisée selon une architecture en couches :

`Routes -> Controllers -> Services -> Repositories -> Data source`

## Rôle de chaque couche

### Routes

Les routes déclarent uniquement les endpoints HTTP et branchent les middlewares transverses :

- authentification
- autorisation
- validation
- rate limiting

### Controllers

Les contrôleurs gèrent uniquement la couche HTTP :

- lecture de `req.params`, `req.query`, `req.body`
- appel du service adapté
- formatage de la réponse JSON
- transmission des erreurs au middleware global

### Services

Les services portent la logique métier :

- vérifications fonctionnelles
- contrôle d'existence
- calculs
- orchestration entre plusieurs repositories

### Repositories

Les repositories encapsulent l'accès aux données. Cette couche permet de changer la source de données sans modifier les services.

## Dossiers principaux

```text
src/
├── config/
├── middleware/
├── modules/
│   ├── auth/
│   ├── bins/
│   └── health/
├── services/
└── utils/
```

## Choix clés

- séparation stricte des responsabilités
- middleware global de gestion d'erreurs
- logs structurés
- auth et refresh tokens isolés
- health checks dédiés pour API, base et cache
