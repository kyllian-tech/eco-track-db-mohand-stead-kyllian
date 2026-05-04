# Audit de l'architecture initiale

## Problèmes observés

- une partie de la logique était encore concentrée dans les contrôleurs
- la sécurité n'était pas homogène sur tous les modules
- l'authentification JWT n'était pas implémentée
- l'autorisation par rôle n'était pas implémentée
- aucun rate limiting global n'était présent
- les logs n'étaient pas structurés
- les health checks étaient trop basiques
- les tests automatisés étaient absents
- la gestion des erreurs était répétitive selon les modules

## Décisions de correction

- ajout d'un module `auth`
- ajout de middlewares transverses dédiés
- ajout d'un middleware global d'erreur
- sécurisation des routes critiques
- ajout de tests automatisés
- ajout de documentation technique
