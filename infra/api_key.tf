# API Key and Usage Plan for frontend authentication
# Provides rate limiting and access control

# -----------------------------------------------------------------------------
# API Key for Frontend
# -----------------------------------------------------------------------------

resource "aws_api_gateway_api_key" "frontend" {
  name        = "warehouse-frontend-key-${var.environment}"
  description = "API key for warehouse pickup queue frontend"
  enabled     = true
}

# -----------------------------------------------------------------------------
# Usage Plan with Rate Limiting
# -----------------------------------------------------------------------------

resource "aws_api_gateway_usage_plan" "main" {
  name        = "warehouse-usage-plan-${var.environment}"
  description = "Usage plan for warehouse NetSuite integration API"

  api_stages {
    api_id = aws_api_gateway_rest_api.main.id
    stage  = aws_api_gateway_stage.prod.stage_name
  }

  throttle_settings {
    rate_limit  = 100  # Requests per second
    burst_limit = 200  # Maximum concurrent requests
  }

  quota_settings {
    limit  = 10000  # Maximum requests per day
    period = "DAY"
  }
}

# -----------------------------------------------------------------------------
# Associate API Key with Usage Plan
# CRITICAL: Deployment must depend on this to prevent API key bypass
# -----------------------------------------------------------------------------

resource "aws_api_gateway_usage_plan_key" "main" {
  key_id        = aws_api_gateway_api_key.frontend.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.main.id
}
