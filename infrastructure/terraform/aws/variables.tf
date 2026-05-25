variable "aws_region" {
  description = "AWS region for the Raushni infrastructure."
  type        = string
  default     = "ap-south-1"
}

variable "project" {
  description = "Project identifier used in resource names and tags."
  type        = string
  default     = "raushni"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "Primary public domain."
  type        = string
  default     = "raushni.com"
}

variable "hosted_zone_id" {
  description = "Optional Route53 hosted zone id for DNS validation records. Leave empty to create ACM cert only."
  type        = string
  default     = ""
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.42.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones to use."
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b"]
}

variable "kubernetes_version" {
  description = "EKS Kubernetes version."
  type        = string
  default     = "1.30"
}

variable "node_instance_types" {
  description = "EKS managed node group instance types."
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_min_size" {
  type    = number
  default = 2
}

variable "node_desired_size" {
  type    = number
  default = 3
}

variable "node_max_size" {
  type    = number
  default = 6
}

variable "db_instance_class" {
  description = "RDS instance size."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Initial RDS storage in GB."
  type        = number
  default     = 30
}

variable "db_master_username" {
  description = "RDS master username."
  type        = string
  default     = "raushni_admin"
}

variable "db_master_password" {
  description = "RDS master password. Pass through TF_VAR_db_master_password or a tfvars file kept outside git."
  type        = string
  sensitive   = true
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type."
  type        = string
  default     = "cache.t4g.micro"
}

variable "app_secret_name" {
  description = "AWS Secrets Manager secret name consumed by Kubernetes External Secrets."
  type        = string
  default     = "/raushni/production/app"
}

variable "external_secrets_namespace" {
  description = "Namespace where External Secrets Operator runs."
  type        = string
  default     = "external-secrets"
}

variable "external_secrets_service_account" {
  description = "External Secrets Operator service account name used for IRSA."
  type        = string
  default     = "external-secrets"
}
