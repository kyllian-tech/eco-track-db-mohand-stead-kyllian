provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "ecotrack"
      ManagedBy   = "terraform"
      Environment = var.environment
    }
  }
}

# ── EKS Cluster ────────────────────────────────────────────────────────────────
module "eks" {
  source          = "./modules/eks"
  cluster_name    = "ecotrack-${var.environment}"
  cluster_version = "1.29"
  vpc_id          = module.networking.vpc_id
  subnet_ids      = module.networking.private_subnet_ids
  node_groups = {
    general = {
      instance_types = ["t3.medium"]
      min_size       = 3
      max_size       = 20
      desired_size   = 3
    }
  }
}

# ── Networking ─────────────────────────────────────────────────────────────────
module "networking" {
  source             = "./modules/networking"
  vpc_cidr           = "10.0.0.0/16"
  availability_zones = ["eu-west-3a", "eu-west-3b", "eu-west-3c"]
  environment        = var.environment
}

# ── S3 Terraform State Bucket ──────────────────────────────────────────────────
resource "aws_s3_bucket" "terraform_state" {
  bucket = "ecotrack-terraform-state"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.terraform_state.arn
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket                  = aws_s3_bucket.terraform_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ── DynamoDB State Lock Table ──────────────────────────────────────────────────
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "ecotrack-terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  server_side_encryption {
    enabled = true
  }

  point_in_time_recovery {
    enabled = true
  }
}

# ── KMS Key for State Encryption ───────────────────────────────────────────────
resource "aws_kms_key" "terraform_state" {
  description             = "KMS key for Terraform state encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}

# ── RDS PostgreSQL ─────────────────────────────────────────────────────────────
resource "aws_db_instance" "ecotrack" {
  identifier             = "ecotrack-${var.environment}"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = var.rds_instance_class
  allocated_storage      = 100
  max_allocated_storage  = 1000
  storage_encrypted      = true
  kms_key_id             = aws_kms_key.rds.arn
  db_name                = "ecotrack"
  username               = "ecotrack_admin"
  password               = var.rds_password
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.ecotrack.name
  backup_retention_period = 30
  deletion_protection    = true
  multi_az               = var.environment == "prod"
  skip_final_snapshot    = var.environment != "prod"

  tags = {
    Name = "ecotrack-${var.environment}"
  }
}

resource "aws_kms_key" "rds" {
  description         = "KMS key for RDS encryption at rest"
  enable_key_rotation = true
}

# ── ElastiCache Redis ──────────────────────────────────────────────────────────
resource "aws_elasticache_replication_group" "ecotrack" {
  replication_group_id       = "ecotrack-${var.environment}"
  description                = "EcoTrack Redis cache"
  node_type                  = "cache.t3.micro"
  num_cache_clusters         = var.environment == "prod" ? 3 : 1
  automatic_failover_enabled = var.environment == "prod"
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  kms_key_id                 = aws_kms_key.redis.arn
  subnet_group_name          = aws_elasticache_subnet_group.ecotrack.name
  security_group_ids         = [aws_security_group.redis.id]
}

resource "aws_kms_key" "redis" {
  description         = "KMS key for ElastiCache encryption at rest"
  enable_key_rotation = true
}

# ── M4.15 Disaster Recovery Resources ─────────────────────────────────────────
resource "aws_s3_bucket" "dr_backup" {
  bucket = "ecotrack-dr-backup-${var.environment}"
  provider = aws.dr_region
}

resource "aws_db_instance_automated_backups_replication" "ecotrack" {
  source_db_instance_arn = aws_db_instance.ecotrack.arn
  kms_key_id             = aws_kms_key.rds.arn
  provider               = aws.dr_region
}
