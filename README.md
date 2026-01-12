# ECOTRACK – API Backend & Base de Données

## Présentation du projet
Ce dépôt contient le projet **ECOTRACK**, une API backend développée en JavaScript dans le cadre du **Master 1 Informatique**.

Le projet met en œuvre :
- une architecture backend structurée (MVC)
- une logique de gamification (points, badges, classement)
- une authentification sécurisée
- une connexion à une base de données via **Supabase**
- une organisation claire du code et de la documentation

---

## Structure du projet

### .git/
Dossier interne de Git contenant l’historique des versions, les commits et les branches du projet.  
 Ce dossier ne doit jamais être modifié manuellement.

---

### .gitignore
Fichier listant les fichiers et dossiers ignorés par Git (ex : fichiers temporaires, dépendances, variables sensibles).

---

### .env
Fichier de configuration contenant les variables d’environnement (clés API, paramètres Supabase, etc.).  
 Ce fichier est sensible et ne doit pas être rendu public.

---

### src/
Dossier principal contenant **le code source de l’API backend**.

#### src/config/
- `testSupabase.js` : fichier de test permettant de vérifier la connexion à Supabase.

#### src/controllers/
Contient les **contrôleurs** de l’application (pattern MVC).  
Ils gèrent les requêtes HTTP et la logique applicative.
- `badgesControllers.js`
- `challengesControllers.js`
- `profilesControllers.js`

#### src/routes/
Définition des **routes de l’API**.  
Chaque route est associée à un contrôleur.
- `badgesRoutes.js`
- `challengesRoutes.js`
- `profilesRoutes.js`

#### src/middleware/
Contient les **middlewares** de l’application.
- `auth.js` : vérifie l’authentification des utilisateurs et sécurise l’accès aux routes.

#### src/service-gamification/
Module dédié à la **logique métier de gamification** :
- `badges.js` : gestion et attribution des badges
- `leaderboard.js` : gestion du classement des utilisateurs
- `pointsSystem.js` : calcul et attribution des points
- `README.md` : documentation du module de gamification

---

##  Architecture du projet
Le projet suit une architecture classique et maintenable :

