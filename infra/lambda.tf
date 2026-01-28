# Lambda function and IAM resources for NetSuite integration
# Handles order validation requests from the frontend

# -----------------------------------------------------------------------------
# IAM Role for Lambda Execution
# -----------------------------------------------------------------------------

resource "aws_iam_role" "lambda_exec" {
  name = "warehouse-netsuite-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# -----------------------------------------------------------------------------
# Lambda Code Packaging
# -----------------------------------------------------------------------------

data "archive_file" "lambda_code" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda"
  output_path = "${path.module}/.build/lambda_code.zip"
  excludes = [
    "__pycache__",
    "*.pyc",
    ".pytest_cache",
    "tests",
    "layer",
    "requirements.txt"
  ]
}

# -----------------------------------------------------------------------------
# Lambda Dependencies Layer
# Built separately via build script: pip install -r requirements.txt -t layer/python/
# Then zip: cd layer && zip -r python.zip python/
# -----------------------------------------------------------------------------

resource "aws_lambda_layer_version" "dependencies" {
  layer_name          = "warehouse-netsuite-deps-${var.environment}"
  filename            = "${path.module}/../lambda/layer/python.zip"
  compatible_runtimes = ["python3.12"]
  description         = "Python dependencies for NetSuite integration (netsuite, pydantic, httpx)"

  # Only create layer if the zip file exists
  # The build script must be run before tofu apply
  lifecycle {
    create_before_destroy = true
  }
}

# -----------------------------------------------------------------------------
# Lambda Function
# -----------------------------------------------------------------------------

resource "aws_lambda_function" "netsuite_integration" {
  function_name = "warehouse-netsuite-${var.environment}"
  description   = "Validates customer orders against NetSuite ERP"

  handler     = "handler.lambda_handler"
  runtime     = "python3.12"
  timeout     = 30
  memory_size = 256

  filename         = data.archive_file.lambda_code.output_path
  source_code_hash = data.archive_file.lambda_code.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  layers = [aws_lambda_layer_version.dependencies.arn]

  environment {
    variables = {
      # NetSuite credentials (Token-Based Authentication)
      NETSUITE_ACCOUNT_ID      = var.netsuite_account_id
      NETSUITE_CONSUMER_KEY    = var.netsuite_consumer_key
      NETSUITE_CONSUMER_SECRET = var.netsuite_consumer_secret
      NETSUITE_TOKEN_ID        = var.netsuite_token_id
      NETSUITE_TOKEN_SECRET    = var.netsuite_token_secret

      # Supabase credentials for order caching
      SUPABASE_URL             = var.supabase_url
      SUPABASE_SERVICE_ROLE_KEY = var.supabase_service_role_key

      # CORS configuration
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution
  ]
}
