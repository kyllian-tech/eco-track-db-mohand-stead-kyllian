# Guide de Déploiement Production — EcoTrack API

## Prérequis

| Composant | Version requise |
|-----------|----------------|
| Kubernetes | ≥ 1.28 |
| Helm | ≥ 3.12 |
| kubectl | ≥ 1.28 |
| Terraform | ≥ 1.6 |
| Node.js | 20 LTS |
| PostgreSQL (Supabase) | 15.4 |
| Redis | 7.2 |
| Kafka | 3.5 (MSK) |

---

## 1. Provisionnement Infrastructure (Terraform)

```bash
cd infrastructure/terraform

# Initialiser le backend remote (S3 + DynamoDB)
terraform init -backend-config="bucket=ecotrack-terraform-state" \
               -backend-config="key=prod/ecotrack-api/terraform.tfstate" \
               -backend-config="region=eu-west-3"

# Planifier les changements
terraform plan -var="environment=prod" -var="rds_password=<SECRET>" -out=tfplan

# Appliquer (crée EKS, RDS, ElastiCache, S3, DynamoDB lock table)
terraform apply tfplan
```

**Résultat :** cluster EKS `ecotrack-prod`, RDS PostgreSQL 15.4, ElastiCache Redis 7.2, tous chiffrés KMS.

---

## 2. Configuration Vault

```bash
# Initialiser Vault
vault operator init -key-shares=5 -key-threshold=3

# Déverrouiller (3 clés requises)
vault operator unseal <KEY_1>
vault operator unseal <KEY_2>
vault operator unseal <KEY_3>

# Créer les secrets
vault kv put secret/ecotrack/api/jwt \
  secret=$(openssl rand -hex 64) \
  refresh_secret=$(openssl rand -hex 64)

vault kv put secret/ecotrack/api/supabase \
  url=https://xxx.supabase.co \
  service_role_key=<KEY>

vault kv put secret/ecotrack/api/redis \
  url=redis://ecotrack-redis.xxx.cache.amazonaws.com:6379

# Appliquer la policy
vault policy write ecotrack-api infrastructure/vault/policy.hcl

# Activer l'authentification Kubernetes
vault auth enable kubernetes
vault write auth/kubernetes/config \
  kubernetes_host="https://$(kubectl get svc kubernetes -o jsonpath='{.spec.clusterIP}'):443"

# Créer le rôle pour le service account
vault write auth/kubernetes/role/ecotrack-api \
  bound_service_account_names=ecotrack-api \
  bound_service_account_namespaces=ecotrack-prod \
  policies=ecotrack-api \
  ttl=1h
```

---

## 3. Déploiement Kubernetes (kubectl)

```bash
# Créer le namespace
kubectl apply -f k8s/namespace.yaml

# Installer External Secrets Operator
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets -n external-secrets --create-namespace

# Configurer External Secrets (sync Vault → K8s Secrets)
kubectl apply -f infrastructure/vault/external-secret.yaml

# Appliquer les manifests
kubectl apply -f k8s/ -n ecotrack-prod

# Vérifier le déploiement
kubectl rollout status deployment/ecotrack-api-blue -n ecotrack-prod
kubectl get pods -n ecotrack-prod
```

---

## 4. Déploiement via Helm (recommandé)

```bash
# Ajouter le repo Bitnami (dépendances Redis)
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Installer/Mettre à jour
helm upgrade --install ecotrack-api helm/ecotrack-api/ \
  --namespace ecotrack-prod \
  --create-namespace \
  --values helm/ecotrack-api/values.yaml \
  --set image.tag=$(git rev-parse --short HEAD) \
  --wait --timeout=5m

# Vérifier
helm list -n ecotrack-prod
kubectl get all -n ecotrack-prod
```

---

## 5. Vérification Post-Déploiement

```bash
# Health checks
curl -s https://api.ecotrack.com/health/live | jq .
curl -s https://api.ecotrack.com/health/ready | jq .
curl -s https://api.ecotrack.com/health/full | jq .

# Métriques Prometheus
curl -s https://api.ecotrack.com/metrics | head -20

# Test d'authentification
curl -s -X POST https://api.ecotrack.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ecotrack.com","password":"Test123!"}' | jq .

# Smoke test K6
k6 run --env BASE_URL=https://api.ecotrack.com tests/load/k6-smoke.js
```

---

## 6. Procédure de Rollback

### Via Blue/Green (immédiat)
```bash
# Identifier la couleur active
CURRENT=$(kubectl get svc ecotrack-api -n ecotrack-prod \
  -o jsonpath='{.spec.selector.color}')
OLD=$([ "$CURRENT" = "blue" ] && echo "green" || echo "blue")

# Basculer vers l'ancienne version
kubectl patch svc ecotrack-api -n ecotrack-prod \
  -p "{\"spec\":{\"selector\":{\"color\":\"$OLD\"}}}"

echo "Traffic shifted from $CURRENT to $OLD"
```

### Via Helm
```bash
helm rollback ecotrack-api -n ecotrack-prod
```

### Via kubectl
```bash
kubectl rollout undo deployment/ecotrack-api-blue -n ecotrack-prod
```

---

## 7. Disaster Recovery

### RTO (Recovery Time Objective) : < 1 heure
### RPO (Recovery Point Objective) : < 24 heures

```bash
# Vérifier les backups RDS disponibles
aws rds describe-db-snapshots \
  --db-instance-identifier ecotrack-prod \
  --query 'DBSnapshots[?Status==`available`].[DBSnapshotIdentifier,SnapshotCreateTime]' \
  --output table

# Restaurer RDS depuis un snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier ecotrack-prod-restored \
  --db-snapshot-identifier rds:ecotrack-prod-2026-05-03

# Rediriger l'application vers la nouvelle instance
vault kv put secret/ecotrack/api/supabase \
  url=https://<new-supabase-url>.supabase.co \
  service_role_key=<KEY>

# Force un redéploiement pour charger les nouveaux secrets
kubectl rollout restart deployment/ecotrack-api-blue -n ecotrack-prod
```

---

## 8. Monitoring et Alertes

```bash
# Vérifier l'état des alertes Prometheus
kubectl exec -n monitoring deployment/prometheus -- \
  promtool check rules /etc/prometheus/rules/*.yml

# Tester une alerte manuellement
kubectl exec -n monitoring deployment/alertmanager -- \
  amtool check-config /etc/alertmanager/alertmanager.yml

# Vérifier les dashboards Grafana
kubectl port-forward -n monitoring svc/grafana 3001:3000
# → http://localhost:3001
```

---

## 9. Sécurité Post-Déploiement

```bash
# Scan de vulnérabilités de l'image
trivy image registry.gitlab.com/ecotrack/ecotrack-api:latest

# Vérifier les Network Policies
kubectl get networkpolicies -n ecotrack-prod

# Tester l'isolation réseau
kubectl run test-pod --rm -i --image=curlimages/curl -n ecotrack-prod -- \
  curl -m 5 http://redis:6379 || echo "Connection denied (expected)"

# Vérifier les RBAC
kubectl auth can-i --list --as=system:serviceaccount:ecotrack-prod:ecotrack-api
```

---

## 10. DNS et SSL

```bash
# Vérifier le certificat TLS
echo | openssl s_client -connect api.ecotrack.com:443 2>/dev/null | \
  openssl x509 -noout -dates

# cert-manager vérifie et renouvelle automatiquement les certificats Let's Encrypt
kubectl get certificate -n ecotrack-prod
kubectl get certificaterequest -n ecotrack-prod
```
