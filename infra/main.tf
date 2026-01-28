# OpenTofu configuration for Warehouse Pickup Queue - NetSuite Integration
# Manages AWS Lambda + API Gateway infrastructure for order validation

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }

  # Local state for now - can migrate to S3 backend later
  # backend "s3" {
  #   bucket         = "warehouse-terraform-state"
  #   key            = "netsuite-integration/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "warehouse-pickup-queue"
      Environment = var.environment
      ManagedBy   = "opentofu"
    }
  }
}
