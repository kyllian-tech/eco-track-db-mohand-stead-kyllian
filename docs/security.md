# Sécurité ECOTRACK API

## 1. Validation stricte

Toutes les données entrantes passent par Zod avant traitement. Cela permet de rejeter très tôt les payloads invalides.

## 2. Authentification JWT

L'API génère :

- un access token court (`15m`)
- un refresh token plus long (`7d`)

Les secrets sont externalisés dans les variables d'environnement.

## 3. Autorisations RBAC

Le middleware `authorize()` vérifie que le rôle de l'utilisateur est bien autorisé pour la route visée.

## 4. Hash des mots de passe

Le module `src/utils/password.js` utilise `bcryptjs` si disponible et bascule sinon sur `crypto.scrypt`, ce qui garantit qu'aucun mot de passe n'est stocké en clair.

## 5. Rate limiting

Des limiteurs existent pour :

- les endpoints d'authentification
- l'API générale
- la création de mesures

## 6. Entêtes de sécurité

Des entêtes HTTP sont posés pour limiter certains risques côté navigateur :

- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`

## 7. Bonnes pratiques livrées

- `.env.example` fourni
- secrets exclus du dépôt final
- middleware global d'erreur sans fuite excessive d'information en production
