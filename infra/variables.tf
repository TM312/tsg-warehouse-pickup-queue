# Input variables for Warehouse Pickup Queue - NetSuite Integration
# All credential variables are marked sensitive to prevent logging

# -----------------------------------------------------------------------------
# AWS Configuration
# -----------------------------------------------------------------------------

variable "aws_region" {
  description = "AWS region for Lambda and API Gateway deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
  default     = "production"
}

# -----------------------------------------------------------------------------
# NetSuite Credentials (Token-Based Authentication)
# All values are REQUIRED - no defaults provided for security
# Obtain these from NetSuite: Setup > Integration > Manage Integrations
# -----------------------------------------------------------------------------

variable "netsuite_account_id" {
  description = "NetSuite account ID (e.g., 1234567 or 1234567_SB1 for sandbox)"
  type        = string
  sensitive   = true
}

variable "netsuite_consumer_key" {
  description = "NetSuite integration consumer key from the integration record"
  type        = string
  sensitive   = true
}

variable "netsuite_consumer_secret" {
  description = "NetSuite integration consumer secret from the integration record"
  type        = string
  sensitive   = true
}

variable "netsuite_token_id" {
  description = "NetSuite access token ID generated for the integration user"
  type        = string
  sensitive   = true
}

variable "netsuite_token_secret" {
  description = "NetSuite access token secret generated for the integration user"
  type        = string
  sensitive   = true
}

# -----------------------------------------------------------------------------
# Supabase Credentials (for Order Caching)
# All values are REQUIRED - no defaults provided for security
# Obtain these from Supabase Dashboard > Settings > API
# -----------------------------------------------------------------------------

variable "supabase_url" {
  description = "Supabase project URL for order caching (e.g., https://xyz.supabase.co)"
  type        = string
  sensitive   = true
}

variable "supabase_service_role_key" {
  description = "Supabase service role key - bypasses RLS for cache operations"
  type        = string
  sensitive   = true
}

# -----------------------------------------------------------------------------
# API Configuration
# -----------------------------------------------------------------------------

variable "allowed_origins" {
  description = "CORS allowed origins for API Gateway (comma-separated or * for all)"
  type        = string
  default     = "*"
}
