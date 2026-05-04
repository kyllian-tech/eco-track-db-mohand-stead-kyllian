# Runbook — Violation de Données Personnelles (Data Breach)

**Sévérité :** P0 — CRITIQUE  
**Délai CNIL :** 72 heures max (Art. 33 RGPD)  
**Responsable :** RSSI + DPO

---

## Symptômes d'une violation potentielle

- Alerte SIEM : accès massif à la table `profiles` ou `signalements` hors horaires normaux
- Exfiltration détectée (volume anormal de données sortantes)
- Signalement d'un employé ou tiers
- Découverte de données EcoTrack sur un forum/darkweb

---

## Étape 1 — Confinement immédiat (< 1 heure)

```bash
# 1. Couper le trafic entrant si compromission confirmée
kubectl patch svc ecotrack-api -n ecotrack-prod \
  -p '{"spec":{"selector":{"app":"maintenance"}}}'

# 2. Révoquer les tokens JWT existants
# (changer le JWT_SECRET force la ré-authentification de tous les utilisateurs)
# Via Vault :
vault kv put secret/ecotrack/api/jwt secret=$(openssl rand -hex 64)
# Redéployer pour prendre en compte le nouveau secret
kubectl rollout restart deployment/ecotrack-api-blue -n ecotrack-prod

# 3. Bloquer les IPs suspectes au niveau WAF (CloudFlare)
# Dashboard CloudFlare → Security → WAF → Custom Rules

# 4. Activer la collecte forensique
kubectl exec -n ecotrack-prod <suspect-pod> -- cat /tmp/access.log > /tmp/forensic-$(date +%s).log
```

---

## Étape 2 — Évaluation de l'impact (< 2 heures)

- Quelles données ont été exposées ? (email, localisation, historique)
- Combien de personnes sont affectées ?
- La violation est-elle encore en cours ?
- Les données sont-elles chiffrées ? (réduction du risque)

```sql
-- Requête Supabase pour évaluer les données potentiellement exposées
SELECT COUNT(DISTINCT user_id), MIN(created_at), MAX(created_at)
FROM signalements
WHERE created_at BETWEEN '<window_start>' AND '<window_end>';
```

---

## Étape 3 — Notification CNIL (< 72 heures)

**Via le portail CNIL :** notifications.cnil.fr

**Informations requises :**
1. Nature de la violation (accès non autorisé / perte / altération)
2. Catégories et nombre approximatif de personnes concernées
3. Catégories et nombre approximatif d'enregistrements
4. Coordonnées du DPO
5. Conséquences probables de la violation
6. Mesures prises ou envisagées

---

## Étape 4 — Notification des personnes concernées (si risque élevé)

Si la violation présente un **risque élevé** pour les droits des personnes (Art. 34 RGPD) :

```
Objet : [IMPORTANT] Information concernant vos données personnelles EcoTrack

Madame, Monsieur,

Nous vous informons qu'une violation de données personnelles vous concernant
a été détectée le [DATE]. Les données potentiellement exposées sont : [LISTE].

Nous avons immédiatement pris les mesures suivantes : [MESURES].

Nous vous recommandons de [RECOMMANDATIONS].

Pour toute question : dpo@ecotrack.com
```

---

## Étape 5 — Rétablissement et post-mortem

1. Corriger la vulnérabilité exploitée
2. Renforcer les contrôles de sécurité
3. Documenter le post-mortem complet
4. Mettre à jour la cartographie des risques
5. Former l'équipe si nécessaire

---

## Communication interne

| Qui | Délai | Canal |
|-----|-------|-------|
| RSSI | Immédiat | Téléphone |
| DPO | < 1h | Email sécurisé |
| Direction | < 2h | Réunion d'urgence |
| Équipe technique | < 2h | Canal Slack #incident-security |
| Clients affectés | < 24h si risque élevé | Email direct |
