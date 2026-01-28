# Phase 2: NetSuite Integration - Research

**Researched:** 2026-01-28
**Domain:** NetSuite REST API integration via AWS Lambda with API Gateway
**Confidence:** MEDIUM

## Summary

This phase implements order validation against NetSuite ERP using a Python Lambda function exposed via API Gateway. The core technology stack is locked by user decision: `python-netsuite` library for async NetSuite REST API calls, OpenTofu for AWS infrastructure-as-code, and API Gateway with API key authentication.

The `netsuite` Python library (v0.12.0, released March 2024) provides async support for NetSuite REST API and SuiteQL queries. Token-based authentication (TBA) is the standard mechanism, using OAuth 1.0 with SHA256 signatures. NetSuite credentials consist of five values: Account ID, Consumer Key, Consumer Secret, Token ID, and Token Secret.

Key architectural pattern: Frontend calls Lambda directly via API Gateway with CORS enabled. Lambda executes SuiteQL queries to find sales orders by order number (tranid), retrieves customer email domain for verification, and returns structured order details. Results are cached in the existing `pickup_requests` table in Supabase.

**Primary recommendation:** Use SuiteQL queries via the `/query/v1/suiteql` endpoint rather than direct REST record access, as SuiteQL allows querying by order number (tranid) while the REST record API requires internal IDs.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| netsuite | 0.12.0 | Async NetSuite REST API client | Only maintained Python library with REST + SuiteQL support |
| OpenTofu | 1.6+ | Infrastructure as code | OSS Terraform fork, full AWS provider compatibility |
| AWS Lambda | Python 3.12 | Serverless compute | Required for python-netsuite (not available in Edge Functions) |
| API Gateway | REST API v1 | HTTP endpoint with API key auth | API key support requires REST API (not HTTP API v2) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| httpx | Latest | Async HTTP client | If netsuite library needs underlying HTTP customization |
| pydantic | 2.x | Request/response validation | Validate Lambda event structure and NetSuite responses |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| netsuite | netsuitesdk | SOAP only, no REST support |
| netsuite | restsuite | Less maintained, OAuth1 manual |
| API Gateway REST | API Gateway HTTP | HTTP v2 lacks native API key support |

**Installation (Lambda layer):**
```bash
pip install netsuite[orjson] pydantic -t python/
```

## Architecture Patterns

### Recommended Project Structure
```
infra/
├── main.tf                    # Provider config, terraform settings
├── variables.tf               # Input variables (account ID, region)
├── outputs.tf                 # Exposed values (API URL, function ARN)
├── lambda.tf                  # Lambda function, layer, IAM role
├── api_gateway.tf             # REST API, resources, methods, CORS
├── api_key.tf                 # API key, usage plan, throttling
└── secrets.tf                 # SSM parameters for NetSuite creds

lambda/
├── handler.py                 # Lambda entry point (thin)
├── services/
│   └── netsuite_service.py    # NetSuite API wrapper
├── models/
│   └── schemas.py             # Pydantic request/response models
└── requirements.txt           # Dependencies for layer
```

### Pattern 1: SuiteQL Query for Order Lookup
**What:** Use SuiteQL to query sales orders by tranid (order number) rather than internal ID
**When to use:** Always - the REST record API requires internal ID which customers don't have
**Example:**
```python
# Source: NetSuite documentation + python-netsuite library
async def find_order_by_number(ns: NetSuite, order_number: str) -> dict | None:
    query = """
        SELECT
            t.id,
            t.tranid,
            t.status,
            BUILTIN.DF(t.status) AS statusName,
            t.entity,
            c.companyname,
            c.email AS customerEmail,
            t.otherrefnum AS poNumber,
            (SELECT COUNT(*) FROM transactionLine tl WHERE tl.transaction = t.id) AS itemCount
        FROM transaction t
        JOIN customer c ON t.entity = c.id
        WHERE t.type = 'SalesOrd'
        AND t.tranid = :orderNumber
    """
    result = await ns.rest_api.suiteql(query, params={"orderNumber": order_number})
    return result.get("items", [None])[0]
```

### Pattern 2: Async Lambda Handler with Event Loop Management
**What:** Properly manage asyncio event loop in Lambda for the async netsuite library
**When to use:** Required - netsuite library is async-only
**Example:**
```python
# Source: AWS Lambda Python async best practices
import asyncio

def lambda_handler(event, context):
    """Lambda entry point - sync wrapper for async logic."""
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(async_handler(event, context))

async def async_handler(event, context):
    """Actual async handler logic."""
    # Initialize NetSuite client and execute queries
    pass
```

### Pattern 3: CORS in Lambda Proxy Integration
**What:** Return CORS headers from Lambda function (not API Gateway config alone)
**When to use:** Required with Lambda proxy integration
**Example:**
```python
# Source: AWS API Gateway CORS documentation
def build_response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",  # Or specific origin
            "Access-Control-Allow-Headers": "Content-Type,X-Api-Key",
            "Access-Control-Allow-Methods": "POST,OPTIONS"
        },
        "body": json.dumps(body)
    }
```

### Anti-Patterns to Avoid
- **Using REST record API for lookup:** Requires internal ID; use SuiteQL instead
- **Using asyncio.run() in Lambda:** Causes event loop errors on warm starts; use get_event_loop().run_until_complete()
- **Storing API key in Lambda code:** Use environment variables or SSM Parameter Store
- **Pip installing asyncio:** It's built into Python 3.7+; pip install causes errors

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OAuth 1.0 signature | Manual HMAC-SHA256 | netsuite library | Signature timing attacks, nonce handling complexity |
| Lambda packaging | Manual zip creation | OpenTofu archive_file + null_resource | Reproducible builds, hash-based deployment |
| API Gateway CORS | Manual mock integration | aws_api_gateway_method for OPTIONS | Complex preflight handling |
| Request validation | Manual event parsing | Pydantic BaseModel | Type safety, automatic error messages |
| Lambda layer builds | Manual pip install | Docker-based build | Linux compatibility for compiled deps |

**Key insight:** NetSuite OAuth 1.0 authentication is notoriously complex with signature generation, timestamp validation, and nonce uniqueness. The netsuite library handles all of this internally.

## Common Pitfalls

### Pitfall 1: Cold Start Async Event Loop
**What goes wrong:** `RuntimeError: asyncio.run() cannot be called from a running event loop`
**Why it happens:** On Lambda warm starts, an event loop may already exist; asyncio.run() tries to create a new one
**How to avoid:** Use `asyncio.get_event_loop().run_until_complete()` instead of `asyncio.run()`
**Warning signs:** Intermittent failures that work on first invocation but fail on subsequent

### Pitfall 2: SuiteQL vs REST Record Metadata Mismatch
**What goes wrong:** Queries fail or return unexpected field names
**Why it happens:** SuiteQL uses different metadata than REST Web Services - it's more like Saved Search
**How to avoid:** Query the `transaction` table with `type = 'SalesOrd'`, not a `salesorder` table
**Warning signs:** Empty results when you expect data; field name errors

### Pitfall 3: API Gateway Deployment Order
**What goes wrong:** API key requirement bypassed; requests without key succeed
**Why it happens:** Terraform applies deployment before API key/usage plan association
**How to avoid:** Add explicit `depends_on` from deployment to usage plan key association
**Warning signs:** Unauthenticated requests succeed in some deployments

### Pitfall 4: Lambda Package Size with Native Dependencies
**What goes wrong:** Lambda fails to start or import errors
**Why it happens:** Dependencies compiled on macOS/Windows incompatible with Lambda Linux
**How to avoid:** Build layer using Docker with `--platform manylinux2014_x86_64` or use AWS Lambda Python base image
**Warning signs:** Works locally, fails in Lambda with ImportError

### Pitfall 5: NetSuite Rate Limits and Governance
**What goes wrong:** `SuiteTalkError: EXCEEDED_RATE_LIMIT` or throttled responses
**Why it happens:** NetSuite has per-account concurrent request limits
**How to avoid:** Single query per request; cache aggressively; implement backoff
**Warning signs:** Sporadic 503 or timeout errors under load

### Pitfall 6: Email Domain Extraction
**What goes wrong:** Domain comparison fails for valid customers
**Why it happens:** Customer email in NetSuite may be blank, use subdomain, or have multiple contacts
**How to avoid:** Handle null emails gracefully; consider domain normalization; flag but don't block mismatches
**Warning signs:** High rate of flagged legitimate customers

## Code Examples

Verified patterns from official sources:

### NetSuite Client Configuration
```python
# Source: python-netsuite documentation
from netsuite import NetSuite, Config, TokenAuth
import os

def get_netsuite_client() -> NetSuite:
    config = Config(
        account=os.environ["NETSUITE_ACCOUNT_ID"],
        auth=TokenAuth(
            consumer_key=os.environ["NETSUITE_CONSUMER_KEY"],
            consumer_secret=os.environ["NETSUITE_CONSUMER_SECRET"],
            token_id=os.environ["NETSUITE_TOKEN_ID"],
            token_secret=os.environ["NETSUITE_TOKEN_SECRET"],
        ),
    )
    return NetSuite(config)
```

### SuiteQL Query Execution
```python
# Source: python-netsuite + NetSuite SuiteQL docs
async def execute_suiteql(ns: NetSuite, query: str, limit: int = 10) -> list[dict]:
    """Execute a SuiteQL query and return results."""
    async with ns:
        response = await ns.rest_api.request(
            "POST",
            "/query/v1/suiteql",
            json={"q": query},
            headers={"Prefer": "transient"},
            params={"limit": str(limit)}
        )
        return response.get("items", [])
```

### OpenTofu Lambda Function Resource
```hcl
# Source: OpenTofu AWS provider documentation
resource "aws_lambda_function" "netsuite_integration" {
  function_name = "warehouse-netsuite-integration"
  handler       = "handler.lambda_handler"
  runtime       = "python3.12"
  timeout       = 30
  memory_size   = 256

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  role = aws_iam_role.lambda_exec.arn

  layers = [aws_lambda_layer_version.dependencies.arn]

  environment {
    variables = {
      NETSUITE_ACCOUNT_ID     = var.netsuite_account_id
      NETSUITE_CONSUMER_KEY   = var.netsuite_consumer_key
      NETSUITE_CONSUMER_SECRET = var.netsuite_consumer_secret
      NETSUITE_TOKEN_ID       = var.netsuite_token_id
      NETSUITE_TOKEN_SECRET   = var.netsuite_token_secret
    }
  }
}
```

### API Gateway with API Key
```hcl
# Source: Terraform AWS provider documentation
resource "aws_api_gateway_rest_api" "main" {
  name           = "warehouse-netsuite-api"
  api_key_source = "HEADER"
}

resource "aws_api_gateway_api_key" "frontend" {
  name    = "warehouse-frontend-key"
  enabled = true
}

resource "aws_api_gateway_usage_plan" "main" {
  name = "warehouse-usage-plan"

  api_stages {
    api_id = aws_api_gateway_rest_api.main.id
    stage  = aws_api_gateway_stage.prod.stage_name
  }

  throttle_settings {
    rate_limit  = 100
    burst_limit = 200
  }
}

resource "aws_api_gateway_usage_plan_key" "main" {
  key_id        = aws_api_gateway_api_key.frontend.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.main.id
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| User credentials auth | Token-based auth (TBA) | NetSuite 2021.1 | User credentials deprecated; must use TBA |
| SHA1 signatures | SHA256 signatures | NetSuite 2021.1 | SHA1 no longer supported |
| SOAP-first integration | REST + SuiteQL | 2020+ | SuiteQL is faster and more flexible |
| Terraform | OpenTofu | Aug 2023 | Same syntax, OSS license |
| Lambda Python 3.8/3.9 | Lambda Python 3.12 | Late 2023 | Better performance, SnapStart support |

**Deprecated/outdated:**
- **User credentials authentication:** Deprecated in NetSuite 2021; use token-based auth
- **SHA1 signatures:** No longer accepted by NetSuite; must use SHA256
- **netsuitesdk library:** SOAP-only, no REST support; use `netsuite` instead

## NetSuite Status Codes Reference

Valid sales order statuses that indicate an order exists and could be picked up:

| Status Code | Status Name | Valid for Pickup |
|-------------|-------------|------------------|
| A | Pending Approval | No - not yet approved |
| B | Pending Fulfillment | Yes - ready for pickup |
| C | Partially Fulfilled | Yes - partial pickup possible |
| D | Pending Billing/Partially Fulfilled | Yes |
| E | Pending Billing | Yes - shipped, awaiting invoice |
| F | Billed | Maybe - already shipped, check with staff |
| G | Closed | No - order closed |
| H | Canceled | No - order canceled |

**Recommendation:** Accept statuses B, C, D, E for pickup. Flag status F (Billed) for staff review.

## Open Questions

Things that couldn't be fully resolved:

1. **Exact customer email field location**
   - What we know: Customer record has `email` field accessible via SuiteQL JOIN
   - What's unclear: Whether multiple contacts exist, which email takes precedence
   - Recommendation: Query customer.email; handle null gracefully; consider joining contact records if needed

2. **Specific NetSuite account configuration**
   - What we know: Status values and fields are standard
   - What's unclear: Custom fields, approval workflows specific to client account
   - Recommendation: Test with actual credentials; document any custom field mappings

3. **Lambda SnapStart for Python availability**
   - What we know: AWS announced SnapStart for Python 3.12 in late 2024/early 2025
   - What's unclear: Current availability status, compatibility with async libraries
   - Recommendation: Implement without SnapStart initially; evaluate later for cold start optimization

## Sources

### Primary (HIGH confidence)
- [python-netsuite PyPI](https://pypi.org/project/netsuite/) - v0.12.0, Python 3.8+ requirement
- [python-netsuite documentation](https://jacobsvante.github.io/netsuite/) - Config, TokenAuth, REST API usage
- [Oracle NetSuite REST API Sales Order](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_159795471905.html) - Endpoint structure
- [Oracle NetSuite TBA documentation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4381113277.html) - Token authentication
- [AWS Lambda Python layers](https://docs.aws.amazon.com/lambda/latest/dg/python-layers.html) - Packaging requirements
- [HashiCorp Terraform Lambda API Gateway tutorial](https://developer.hashicorp.com/terraform/tutorials/aws/lambda-api-gateway) - Resource configuration

### Secondary (MEDIUM confidence)
- [Tim Dietrich SuiteQL Blog](https://timdietrich.me/blog/netsuite-suiteql-querying-transactions/) - Query patterns verified against Oracle docs
- [Spacelift Terraform API Gateway](https://spacelift.io/blog/terraform-api-gateway) - Configuration patterns
- [AWS Lambda async Python guide](https://medium.com/@joerosborne/how-to-use-async-python-functions-in-aws-lambda-in-2026-7eceaa797732) - Event loop handling

### Tertiary (LOW confidence)
- [NetSuite status codes gist](https://gist.github.com/W3BGUY/af08ddd92b87641e28df9c26d545d387) - Status code reference (verify against actual account)
- [OpenTofu vs Terraform comparison](https://spacelift.io/blog/opentofu-vs-terraform) - Syntax compatibility claims

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - python-netsuite docs verified, but async Lambda patterns need runtime validation
- Architecture: MEDIUM - patterns from multiple sources, need validation with actual NetSuite account
- Pitfalls: HIGH - documented from multiple sources with consistent warnings

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days - stable domain, but validate NetSuite specifics with client credentials)
