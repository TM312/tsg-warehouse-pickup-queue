# API Gateway REST API for NetSuite integration
# Exposes POST /validate-order endpoint with API key authentication

# -----------------------------------------------------------------------------
# REST API Definition
# -----------------------------------------------------------------------------

resource "aws_api_gateway_rest_api" "main" {
  name           = "warehouse-netsuite-api-${var.environment}"
  description    = "API for validating customer orders against NetSuite"
  api_key_source = "HEADER"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# -----------------------------------------------------------------------------
# Resource: /validate-order
# -----------------------------------------------------------------------------

resource "aws_api_gateway_resource" "validate_order" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "validate-order"
}

# -----------------------------------------------------------------------------
# POST Method - Main endpoint for order validation
# -----------------------------------------------------------------------------

resource "aws_api_gateway_method" "validate_order_post" {
  rest_api_id      = aws_api_gateway_rest_api.main.id
  resource_id      = aws_api_gateway_resource.validate_order.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.validate_order.id
  http_method = aws_api_gateway_method.validate_order_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.netsuite_integration.invoke_arn
}

resource "aws_api_gateway_method_response" "post_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.validate_order.id
  http_method = aws_api_gateway_method.validate_order_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# -----------------------------------------------------------------------------
# OPTIONS Method - CORS preflight (no API key required)
# -----------------------------------------------------------------------------

resource "aws_api_gateway_method" "validate_order_options" {
  rest_api_id      = aws_api_gateway_rest_api.main.id
  resource_id      = aws_api_gateway_resource.validate_order.id
  http_method      = "OPTIONS"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_integration" "options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.validate_order.id
  http_method = aws_api_gateway_method.validate_order_options.http_method

  type = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.validate_order.id
  http_method = aws_api_gateway_method.validate_order_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.validate_order.id
  http_method = aws_api_gateway_method.validate_order_options.http_method
  status_code = aws_api_gateway_method_response.options_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Api-Key,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [
    aws_api_gateway_integration.options
  ]
}

# -----------------------------------------------------------------------------
# Deployment and Stage
# -----------------------------------------------------------------------------

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  # Redeploy when any of these resources change
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.validate_order.id,
      aws_api_gateway_method.validate_order_post.id,
      aws_api_gateway_method.validate_order_options.id,
      aws_api_gateway_integration.lambda.id,
      aws_api_gateway_integration.options.id,
    ]))
  }

  # Ensure all methods and integrations are created before deployment
  # Note: API key requirement is enforced via api_key_required=true on method
  # Usage plan is associated with stage after creation (no cycle)
  depends_on = [
    aws_api_gateway_method.validate_order_post,
    aws_api_gateway_method.validate_order_options,
    aws_api_gateway_integration.lambda,
    aws_api_gateway_integration.options,
    aws_api_gateway_integration_response.options
  ]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = "prod"

  description = "Production stage for NetSuite integration API"

  # Enable access logging (optional - requires CloudWatch log group)
  # access_log_settings {
  #   destination_arn = aws_cloudwatch_log_group.api_gateway.arn
  # }
}

# -----------------------------------------------------------------------------
# Lambda Permission for API Gateway
# -----------------------------------------------------------------------------

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.netsuite_integration.function_name
  principal     = "apigateway.amazonaws.com"

  # Allow invocation from any method on the validate-order resource
  source_arn = "${aws_api_gateway_rest_api.main.execution_arn}/*/${aws_api_gateway_resource.validate_order.path_part}"
}
