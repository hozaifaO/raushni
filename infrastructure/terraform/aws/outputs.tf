output "cluster_name" {
  value = aws_eks_cluster.main.name
}

output "cluster_endpoint" {
  value = aws_eks_cluster.main.endpoint
}

output "vpc_id" {
  value = aws_vpc.main.id
}

output "private_subnet_ids" {
  value = values(aws_subnet.private)[*].id
}

output "public_subnet_ids" {
  value = values(aws_subnet.public)[*].id
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.address
}

output "redis_primary_endpoint" {
  value = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "ecr_repositories" {
  value = {
    for name, repo in aws_ecr_repository.services : name => repo.repository_url
  }
}

output "certificate_arn" {
  value = aws_acm_certificate.main.arn
}
