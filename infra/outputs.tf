# Output values for integration with frontend and debugging
# API endpoint and key values for configuration

# -----------------------------------------------------------------------------
# API Endpoint
# -----------------------------------------------------------------------------

output "api_endpoint" {
  description = "Full URL to POST /validate-order endpoint"
  value       = "${aws_api_gateway_stage.prod.invoke_url}/${aws_api_gateway_resource.validate_order.path_part}"
}

output "api_base_url" {
  description = "Base URL of the API (without path)"
  value       = aws_api_gateway_stage.prod.invoke_url
}

# -----------------------------------------------------------------------------
# API Key (for frontend configuration)
# -----------------------------------------------------------------------------

output "api_key_id" {
  description = "API key ID (use with AWS CLI: aws apigateway get-api-key --api-key <id> --include-value)"
  value       = aws_api_gateway_api_key.frontend.id
}

output "api_key_value" {
  description = "API key value for frontend X-Api-Key header"
  value       = aws_api_gateway_api_key.frontend.value
  sensitive   = true
}

# -----------------------------------------------------------------------------
# Lambda Information (for debugging and logs)
# -----------------------------------------------------------------------------

output "lambda_function_name" {
  description = "Name of the Lambda function (for CloudWatch logs)"
  value       = aws_lambda_function.netsuite_integration.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.netsuite_integration.arn
}

# -----------------------------------------------------------------------------
# Usage Instructions
# -----------------------------------------------------------------------------

output "usage_instructions" {
  description = "How to use the API"
  value       = <<-EOT
    To validate an order:

    curl -X POST ${aws_api_gateway_stage.prod.invoke_url}/${aws_api_gateway_resource.validate_order.path_part} \
      -H "Content-Type: application/json" \
      -H "X-Api-Key: <api_key_value>" \
      -d '{"order_number": "SO-12345", "customer_email": "customer@example.com"}'

    To get the API key value:
    tofu output -raw api_key_value

    To view Lambda logs:
    aws logs tail /aws/lambda/${aws_lambda_function.netsuite_integration.function_name} --follow
  EOT
}
