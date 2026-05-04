# M4.8 — HashiCorp Vault Policy for EcoTrack API
# Grants the ecotrack-api service account read access to its secrets only

# Allow reading API secrets
path "secret/data/ecotrack/api/*" {
  capabilities = ["read"]
}

# Allow reading database credentials (dynamic secrets)
path "database/creds/ecotrack-api-role" {
  capabilities = ["read"]
}

# Allow rotating its own token
path "auth/token/renew-self" {
  capabilities = ["update"]
}

# Deny access to other namespaces
path "secret/data/ecotrack/admin/*" {
  capabilities = ["deny"]
}

path "secret/data/ecotrack/kafka/*" {
  capabilities = ["deny"]
}
