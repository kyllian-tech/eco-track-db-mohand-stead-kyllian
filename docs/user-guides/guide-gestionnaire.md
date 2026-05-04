# Guide Utilisateur — Gestionnaire

## Dashboard EcoTrack — Tableau de Bord

Accès : **https://app.ecotrack.com** → Connexion avec votre compte gestionnaire

---

## 1. Vue d'ensemble (Dashboard Principal)

Le tableau de bord affiche en temps réel :
- **KPIs clés** : nombre de conteneurs actifs, taux de remplissage moyen, signalements ouverts, tournées du jour
- **Carte thermique** : zones à risque de débordement (rouge = urgence)
- **Alertes actives** : conteneurs > 85% de remplissage
- **Performances** : comparaison semaine actuelle vs précédente

---

## 2. Gestion des Tournées

### Créer une tournée
1. **Tournées → Nouvelle Tournée**
2. Sélectionner la zone et les conteneurs à inclure
3. L'optimisation automatique calcule l'itinéraire le plus efficace
4. Assigner un agent de collecte
5. **Enregistrer**

### Modifier une tournée
1. **Tournées → Tournées actives**
2. Cliquer sur la tournée → **Modifier**
3. Ajouter/retirer des conteneurs ou changer l'agent
4. **Sauvegarder**

### Forcer une intervention urgente
1. **Alertes → Conteneurs critiques**
2. Sélectionner le conteneur → **Créer intervention urgente**
3. Un agent disponible reçoit immédiatement la notification

---

## 3. Analyse et Rapports

### Carte Thermique
La carte thermique affiche la concentration de débordements par zone :
- **Bleu** → Risque faible (< 10% des conteneurs > 80%)
- **Jaune** → Risque modéré
- **Rouge** → Risque élevé (> 30% des conteneurs > 80%)

Utilisez ces données pour ajuster la fréquence des tournées par zone.

### Export de données
**Rapports → Export** → Choisir la période et le format (CSV/Excel/PDF)  
Données disponibles : mesures de remplissage, signalements, performances agents

---

## 4. Gestion des Utilisateurs

**Administration → Utilisateurs** :
- Créer des comptes agents
- Assigner des zones aux agents
- Consulter les statistiques individuelles
- Désactiver un compte en cas de départ

---

## 5. Alertes et Notifications

Configurer vos alertes dans **Paramètres → Alertes** :
- Seuil d'alerte remplissage (par défaut : 85%)
- Fréquence des rapports automatiques
- Canal de réception (email, push, SMS)

---

## FAQ Gestionnaire

**Comment voir l'historique d'un conteneur spécifique ?**  
**Conteneurs → Sélectionner le conteneur → Historique** (graphique des 30 derniers jours)

**Comment accorder accès à un nouveau gestionnaire ?**  
**Administration → Utilisateurs → Inviter** → Saisir l'email → Rôle "Gestionnaire"

**Les données sont-elles conformes RGPD ?**  
Oui. Voir le PIA disponible dans **Documentation → Conformité RGPD**
