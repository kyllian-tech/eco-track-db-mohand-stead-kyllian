# CLAUDE.md — Feuille de route ECOTRACK

> **Usage :** Ce fichier est lu à chaque nouvelle session Claude. Il donne le contexte complet du projet, l'état d'avancement et les prochaines tâches. Mis à jour en fin de chaque conversation.

---

## 1. Contexte du projet

**ECOTRACK** — Plateforme intelligente de gestion des déchets urbains.
Projet académique INGETIS (Master 2, RNCP Niveau 7 — EADL 38822).
Équipe : **Mohand** (DB + Mobile + orchestration), **Stead** (back-end), **Kyllian** (front-end).

**Objectif de la phase actuelle :** Connecter le front-end React au back-end Node.js/Express — remplacer toutes les données hardcodées par de vrais appels HTTP vers l'API.

---

## 2. Architecture du projet

```
eco-track-db-mohand-stead-kyllian/
├── src/                    ← BACK-END (Node.js / Express 5)
│   ├── app.js              ← Point d'entrée Express, montage des routes
│   ├── server.js           ← Démarrage HTTP (node src/server.js)
│   ├── modules/            ← 18 modules métier (Clean Architecture)
│   └── data/               ← users.json + refresh-tokens.json (fallback local)
│
├── front-end/              ← FRONT-END (React 19 + Vite 8)
│   └── src/
│       ├── api/
│       │   ├── client.js        ← axios + intercepteurs JWT (auto-refresh 401, exclut /api/auth/)
│       │   ├── auth.js          ← loginApi, registerApi, refreshApi
│       │   ├── containers.js    ← getContainers, createContainer, updateContainer, deleteContainer
│       │   ├── signalements.js  ← getSignalements, createSignalement, updateSignalement
│       │   ├── routes.js        ← getRoutes, createRoute, updateRoute, getRouteSteps
│       │   ├── measurements.js  ← getMeasurements, getLatestMeasurement, createMeasurement
│       │   ├── zones.js         ← getZones
│       │   ├── notifications.js ← getNotifications, markAsRead, updateNotification
│       │   ├── badges.js        ← getBadges, getUserBadges, getChallenges
│       │   └── profiles.js      ← getProfiles, getProfileById, updateProfile
│       ├── context/
│       │   ├── AuthContext.jsx  ← login() réel + loginDemo() + logout()
│       │   └── ToastContext.jsx
│       └── pages/
```

---

## 3. Stack technique

| Couche | Technologie |
|--------|-------------|
| Front-end | React 19 + Vite 8 + react-router-dom v7 + axios + recharts |
| Back-end | Node.js 20 + Express 5 + Zod 4.3.6 + bcryptjs |
| Base de données | Supabase (PostgreSQL + PostGIS) |
| Auth | JWT custom HS256 (access 15min / refresh 7j) |

---

## 4. Rôles & Comptes de démo

| Rôle BDD | Rôle frontend | Espace | Compte démo |
|----------|--------------|--------|-------------|
| `admin` | `admin` | `/space/admin` | `admin@ecotrack.fr` / `Admin2026!` |
| `gestionnaire` | `manager` | `/space/manager` | `manager@ecotrack.fr` / `Manager2026!` |
| `agent` | `agent` | `/space/agent` | `agent@ecotrack.fr` / `Agent2026!` |
| `analyste` | `analyst` | (pas de route dédiée) | — |
| `citoyen` | `citizen` | `/space/citizen` | inscription via l'app |

### Pattern SQL pour créer un compte (à adapter selon le rôle)
```sql
DO $$
DECLARE new_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
  VALUES (new_id, '00000000-0000-0000-0000-000000000000', 'email@ecotrack.fr',
    crypt('MotDePasse!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{"full_name":"Nom Complet"}',
    now(), now(), 'authenticated', 'authenticated');

  INSERT INTO public.users (id, email, password_hash, role, full_name, created_at)
  VALUES (new_id, 'email@ecotrack.fr', crypt('MotDePasse!', gen_salt('bf')), 'role_ici', 'Nom Complet', now());

  INSERT INTO public.profiles (id, email, role, points)
  VALUES (new_id, 'email@ecotrack.fr', 'role_ici', 0)
  ON CONFLICT (id) DO NOTHING;
END $$;
```
⚠️ Après création, mettre à jour le hash avec bcryptjs (cost 12) :
```powershell
node -e "require('bcryptjs').hash('MotDePasse!', 12).then(h => console.log(h))"
```
```sql
UPDATE public.users SET password_hash = 'HASH_ICI' WHERE email = 'email@ecotrack.fr';
```

---

## 5. Énumérations Supabase confirmées

- `container_type` : `OMR` · `RECYCLABLE` · `VERRE` · `COMPOST`
- `route_status` : `PLANIFIEE` · `EN_COURS` · `TERMINEE` · `ANNULEE`
- `signalement_statut` : `OUVERT` · `EN_COURS` · `RESOLU`
- `route_steps` : champs `route_id`, `container_id`, `ordre_passage`, `collecte_effectuee`, `heure_passage`

---

## 6. État actuel des pages

### ✅ Pages connectées au backend

| Page | Espace | Ce qui est branché |
|------|--------|-------------------|
| `Login.jsx` | Tous | POST /api/auth/login |
| `CitizenRegister.jsx` | Citoyen | POST /api/auth/register + auto-login |
| `CitizenSpace.jsx` | Citoyen | Stats : signalements + badges + challenges |
| `CitizenReport.jsx` | Citoyen | POST signalement + sélecteur conteneur |
| `CitizenHistory.jsx` | Citoyen | GET signalements user + badges |
| `CitizenNotifications.jsx` | Citoyen | GET notifications + PATCH markAsRead |
| `Gamification.jsx` | Citoyen | GET badges + user-badges + challenges |
| `AgentSpace.jsx` | Agent | Tournée EN_COURS (filtrée par agent_id) + étapes + anomalies |
| `AgentMap.jsx` | Agent | GET conteneurs + validation collecte |
| `Reports.jsx` | Agent+Manager | GET/PATCH signalements + sélecteur conteneur |
| `Routes.jsx` | Agent+Manager | GET/POST/PATCH tournées + étapes + sélecteur agent |
| `ManagerSpace.jsx` | Manager | Stats globales réelles |
| `Containers.jsx` | Manager | CRUD conteneurs + IoT simulation |
| `AdminSpace.jsx` | Admin | Stats globales (users + conteneurs + signalements) |
| `Users.jsx` | Admin | GET /api/profiles avec recherche/filtre rôle |

### ❌ Pages encore hardcodées

| Page | Espace | À faire |
|------|--------|---------|
| `Profile.jsx` | Tous | GET + PATCH `/api/profiles/:id` |
| `Analytics.jsx` | Manager | GET `/api/measurements` → recharts réels |
| `MapView.jsx` | Manager | Conteneurs sur carte Leaflet |
| `Exports.jsx` | Manager | CSV signalements/conteneurs |
| `SecurityMonitoring.jsx` | Admin | GET `/health/live`, `/metrics` |
| `Notifications.jsx` | Admin | GET `/api/notifications` (toutes) |

---

## 7. Prochaines étapes (par priorité)

1. **`Profile.jsx`** — GET `/api/profiles/:id` + PATCH (tous rôles, le plus utile)
2. **`Analytics.jsx`** — recharts sur vraies mesures IoT
3. **`SecurityMonitoring.jsx`** — health + metrics
4. **`Exports.jsx`** — CSV côté client
5. **`Notifications.jsx`** admin — toutes les notifs

---

## 8. Points techniques importants

### Lancer le projet
```powershell
# Terminal 1 — backend (racine)
npm run dev

# Terminal 2 — frontend
cd front-end && npm run dev
```

### Auth — tokens dans localStorage
```
ecotrack_access_token   → Bearer JWT (15min)
ecotrack_refresh_token  → refresh token (7j)
ecotrack_user           → { id, email, role, full_name }
```

### Supabase
- URL : `https://wxcvilbxppugaiquqjbu.supabase.co`
- Tables : `users`, `profiles`, `containers`, `zones`, `measurements`, `routes`, `route_steps`, `signalements`, `user_refresh_tokens`, `notifications`, `badges`, `user_badges`, `challenges`

---

*Mis à jour le : 28 juin 2026 — Session 6*
