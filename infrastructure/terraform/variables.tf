variable "aws_region" {
  description = "AWS region for primary deployment"
  type        = string
  default     = "eu-west-3"
}

variable "dr_region" {
  description = "AWS region for disaster recovery"
  type        = string
  default     = "eu-central-1"
}

variable "environment" {
  description = "Environment name (dev/staging/prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "rds_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}
