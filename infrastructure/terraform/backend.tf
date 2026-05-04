# M4.7 — Terraform Remote Backend with State Locking
# Stores tfstate in S3 with DynamoDB locking to prevent concurrent modifications

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
  }

  backend "s3" {
    bucket         = "ecotrack-terraform-state"
    key            = "prod/ecotrack-api/terraform.tfstate"
    region         = "eu-west-3"
    encrypt        = true
    kms_key_id     = "arn:aws:kms:eu-west-3:ACCOUNT_ID:key/KEY_ID"

    # DynamoDB state locking
    dynamodb_table = "ecotrack-terraform-locks"
  }
}
