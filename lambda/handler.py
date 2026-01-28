import asyncio
import json
import os
import uuid
from typing import Any

from models.schemas import OrderValidationRequest, OrderValidationResponse, ErrorResponse
from services.netsuite_service import NetSuiteService, OrderNotFoundError, NetSuiteError
from services.cache_service import CacheService
from pydantic import ValidationError

# CORS headers included in all responses
CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": os.environ.get("ALLOWED_ORIGINS", "*"),
    "Access-Control-Allow-Headers": "Content-Type,X-Api-Key",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
}


def lambda_handler(event: dict, context: Any) -> dict:
    """Lambda entry point - sync wrapper for async logic."""
    # Handle CORS preflight
    if event.get("httpMethod") == "OPTIONS":
        return build_response(200, {"message": "OK"})

    # Use existing event loop or create new one (handles warm starts)
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(async_handler(event, context))


async def async_handler(event: dict, context: Any) -> dict:
    """Async handler for order validation with caching."""
    reference_id = str(uuid.uuid4())[:8]

    try:
        # Parse and validate request body
        body = json.loads(event.get("body", "{}"))
        request = OrderValidationRequest(**body)
    except json.JSONDecodeError:
        return build_response(400, ErrorResponse(
            error="Invalid JSON in request body",
            error_code="INVALID_JSON",
            reference_id=reference_id
        ).model_dump())
    except ValidationError as e:
        return build_response(400, ErrorResponse(
            error=f"Invalid request: {e.errors()[0]['msg']}",
            error_code="VALIDATION_ERROR",
            reference_id=reference_id
        ).model_dump())

    try:
        cache_service = CacheService()

        # Step 1: Check cache for existing fresh order data
        cached_order = await cache_service.get_cached_order(request.order_number)

        if cached_order:
            # Re-check email domain match with submitted email
            email_match = cache_service.check_email_domain_match(
                request.email,
                cached_order.get("netsuite_email", "")
            )

            from models.schemas import OrderDetails
            order = OrderDetails(
                order_number=cached_order["sales_order_number"],
                company_name=cached_order["company_name"],
                item_count=cached_order["item_count"],
                po_number=cached_order.get("po_number"),
                status=cached_order.get("netsuite_status", ""),
                status_name=cached_order.get("netsuite_status_name", "Unknown"),
                email_match=email_match,
                valid_for_pickup=cached_order.get("valid_for_pickup", True),
                from_cache=True
            )
            return build_response(200, OrderValidationResponse(order=order).model_dump())

        # Step 2: Query NetSuite for order
        ns_service = NetSuiteService()
        order, netsuite_email = await ns_service.find_order(request.order_number, request.email)

        # Step 3: Cache the result in Supabase for future requests
        await cache_service.cache_order(
            order_number=request.order_number,
            order_details=order,
            netsuite_email=netsuite_email
        )

        return build_response(200, OrderValidationResponse(order=order).model_dump())

    except OrderNotFoundError:
        return build_response(404, ErrorResponse(
            error=f"Order {request.order_number} not found. Make sure you're using the SO number from your confirmation email.",
            error_code="ORDER_NOT_FOUND",
            reference_id=reference_id
        ).model_dump())
    except NetSuiteError as e:
        return build_response(503, ErrorResponse(
            error="Unable to verify order at this time. Please try again.",
            error_code="NETSUITE_ERROR",
            reference_id=reference_id
        ).model_dump())
    except Exception as e:
        return build_response(500, ErrorResponse(
            error="An unexpected error occurred. Please try again.",
            error_code="INTERNAL_ERROR",
            reference_id=reference_id
        ).model_dump())


def build_response(status_code: int, body: dict) -> dict:
    """Build Lambda proxy response with CORS headers."""
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body)
    }
