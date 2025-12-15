+# Eco-Track — Base de données
+

+Ce dépôt contient la base de données et la documentation associée pour le projet Eco-Track (schémas, données, requêtes et configuration de réplication). Ce `README.md` présente l'arborescence, le rôle des fichiers principaux et des instructions rapides pour commencer.
+

+**But du dépôt**: fournir un jeu complet SQL (schéma + données + requêtes) et la configuration de réplication (master + 2 slaves) accompagnés du modèle conceptuel et logique.
+

+**Arborescence & rôle des fichiers**
+
+- `README.md`: Ce fichier — description du dépôt et instructions rapides.
+- `docs/MCD.png`: Modèle Conceptuel de Données (MCD) — diagramme visuel du MCD complet.
+- `docs/MLD.md`: Modèle Logique de Données (MLD).
+- `sql/schema.sql`: 
Script `CREATE TABLE` complet (prévu ~10-14 tables) avec clés primaires/étrangères et contraintes.
+- `sql/data.sql`: Script `INSERT` contenant le jeu de données (>1000 enregistrements) pour tests et développement.
+- `sql/requetes.sql`: Fichier contenant 40 requêtes organisées (séparées par sections) pour reporting, agrégations, jointures, transactions et optimisation.
+- `replication/docker-compose.yml`: Configuration `docker-compose` pour lancer un master PostgreSQL et deux slaves (réplication streaming ou équivalent).
+- `replication/setup.md`: Procédure pas-à-pas pour configurer la réplication (pré-requis, commandes, tests de bascule).
+
+**Sections importantes du dépôt**
+
+- **Modélisation**: consultez `docs/MCD.png` puis `docs/MLD.md` pour comprendre les choix de modélisation, les normalisations (3NF) et les décisions de conception.

+- **Schema & données**: exécutez `sql/schema.sql` puis `sql/data.sql` pour provisionner la base et charger les données.

+- **Requêtes**: `sql/requetes.sql` est organisé en sections (SELECT simples, agrégations, sous-requêtes, vues, procédures stockées si présentes, optimisation et indexation).

+- **Réplication**: `replication/docker-compose.yml` permet de démarrer un environnement local; suivez `replication/setup.md` pour l'initialisation et la vérification

+
+**Instructions rapides**
+
+- Initialiser la base (exemple PostgreSQL local):
+
+```powershell
+# Créer la base (si elle n'existe pas)
+createdb ecotrack_db
+# Appliquer le schéma
+psql -d ecotrack_db -f sql/schema.sql
+# Charger les données (peut prendre du temps selon le volume)
+psql -d ecotrack_db -f sql/data.sql
+```
+
+- Exécuter les requêtes d'exemples:
+
+```powershell
+psql -d ecotrack_db -f sql/requetes.sql
+```
+
+- Démarrer l'environnement de réplication (Docker Compose):
+
+```powershell
+cd replication
+docker-compose up -d
+# Suivre les logs si nécessaire
+docker-compose logs -f
+```
+
+Consultez `replication/setup.md` pour les étapes d'initialisation et tests (promotion du slave, bascule, resynchronisation).

+
+**Vérification & tests**
+
+- Vérifier que toutes les tables existent: `
+\dt` dans `psql` ou requête sur `information_schema.tables`.
+- Vérifier le nombre de lignes attendues pour une table clé: `SELECT COUNT(*) FROM <table>;`.
+- Lancer les 40 requêtes et vérifier qu'elles retournent des résultats attendus; certaines requêtes incluent des commentaires indiquant la sortie attendue.
+

+**Notes sur la qualité des données et performance**
+

+- Les choix de normalisation et d'indexation sont documentés dans `docs/MLD.md`.
+- Si vous chargez `sql/data.sql` dans un environnement de production, préférez des méthodes par lots ou `COPY` pour la performance.
+

+**Contacts & crédits**
+
+- Équipe projet: Mohand, Stead, Kyllian (voir `docs/` pour plus de détails si fournis).
+- Pour toute question sur la réplication ou le schéma, ouvrez une issue ou contactez l'équipe via le canal projet.
+

+**Prochaines étapes suggérées**
+
+- Valider le chargement des données et exécuter un jeu de tests SQL.
+- Tester la réplication en environnement local avec `docker-compose`.
+- Documenter les indices et plans d'exécution pour les requêtes longues (optionnel).
+
