# API ECOTRACK

## Auth

### `POST /api/auth/register`
Crée un utilisateur.

```json
{
  "email": "admin@ecotrack.local",
  "password": "password123",
  "role": "admin"
}
```

### `POST /api/auth/login`
Retourne un access token et un refresh token.

### `POST /api/auth/refresh`
Renouvelle les jetons à partir d'un refresh token valide.

## Health

### `GET /health`
Etat général de l'API.

### `GET /health/db`
Teste la connectivité de la base.

### `GET /health/redis`
Teste l'état du cache.

## Bins

### `GET /api/bins`
Liste les bins.

### `GET /api/bins/:id`
Retourne un bin par identifiant.

### `POST /api/bins`
Protégé. Rôles autorisés : `admin`, `manager`.

### `PATCH /api/bins/:id`
Protégé. Rôles autorisés : `admin`, `manager`, `collector`.

### `DELETE /api/bins/:id`
Protégé. Rôle autorisé : `admin`.
