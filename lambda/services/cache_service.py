import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from supabase import create_client, Client

from models.schemas import OrderDetails

# Cache TTL in hours (from CONTEXT.md: 1-2 hours)
CACHE_TTL_HOURS = 2


class CacheService:
    """Service for caching order data in Supabase pickup_requests table."""

    def __init__(self):
        self.supabase: Client = create_client(
            os.environ["SUPABASE_URL"],
            os.environ["SUPABASE_SERVICE_ROLE_KEY"]
        )

    async def get_cached_order(self, order_number: str) -> Optional[Dict[str, Any]]:
        """
        Check for cached order data in Supabase.

        Returns cached data if:
        1. A pickup_request exists for this order_number
        2. It's not completed or cancelled (still active)
        3. It was created within the TTL window

        Args:
            order_number: Sales order number to look up

        Returns:
            Dict with cached order data if found and fresh, None otherwise
        """
        try:
            # Calculate TTL cutoff time
            cutoff_time = datetime.now(timezone.utc) - timedelta(hours=CACHE_TTL_HOURS)

            # Query for non-completed requests within TTL
            # Uses the sales_order_number column from pickup_requests table
            result = self.supabase.table("pickup_requests") \
                .select("*") \
                .eq("sales_order_number", order_number) \
                .not_.in_("status", ["completed", "cancelled"]) \
                .gte("created_at", cutoff_time.isoformat()) \
                .order("created_at", desc=True) \
                .limit(1) \
                .execute()

            if result.data and len(result.data) > 0:
                cached = result.data[0]
                # Only return if we have the NetSuite-cached fields populated
                if cached.get("company_name"):
                    return cached

            return None

        except Exception as e:
            # Cache miss on error - fall back to NetSuite
            print(f"Cache lookup error: {e}")
            return None

    async def cache_order(
        self,
        order_number: str,
        order_details: OrderDetails,
        netsuite_email: str
    ) -> None:
        """
        Cache order data by updating existing pickup_request or creating placeholder.

        Per CONTEXT.md: Store cached data in pickup_requests table alongside request data.
        This updates the NetSuite cache fields (company_name, item_count, po_number)
        on any existing pending request, or creates a new record for cache-only purposes.

        Args:
            order_number: Sales order number
            order_details: Order details from NetSuite
            netsuite_email: Customer email from NetSuite (for future domain checks)
        """
        try:
            # First, try to find an existing pending request to update
            existing = self.supabase.table("pickup_requests") \
                .select("id") \
                .eq("sales_order_number", order_number) \
                .not_.in_("status", ["completed", "cancelled"]) \
                .limit(1) \
                .execute()

            cache_data = {
                "company_name": order_details.company_name,
                "item_count": order_details.item_count,
                "po_number": order_details.po_number,
                # Store NetSuite status for cache reuse
                "netsuite_status": order_details.status,
                "netsuite_status_name": order_details.status_name,
                "valid_for_pickup": order_details.valid_for_pickup,
                # Store email for domain verification on cache hits
                "netsuite_email": netsuite_email
            }

            if existing.data and len(existing.data) > 0:
                # Update existing request with NetSuite data
                self.supabase.table("pickup_requests") \
                    .update(cache_data) \
                    .eq("id", existing.data[0]["id"]) \
                    .execute()
            else:
                # Create new cache-only record
                # This record will be converted to a real request when customer submits
                self.supabase.table("pickup_requests") \
                    .insert({
                        "sales_order_number": order_number,
                        "customer_email": "",  # Will be filled on actual submission
                        "status": "pending",  # Placeholder status
                        **cache_data
                    }) \
                    .execute()

        except Exception as e:
            # Cache write failure is non-fatal - log and continue
            print(f"Cache write error: {e}")

    def check_email_domain_match(self, submitted_email: str, netsuite_email: str) -> bool:
        """
        Check if submitted email domain matches NetSuite customer email domain.

        Replicates logic from NetSuiteService for cache hits.
        """
        if not netsuite_email:
            return False

        try:
            submitted_domain = submitted_email.lower().split("@")[1]
            netsuite_domain = netsuite_email.lower().split("@")[1]
            return submitted_domain == netsuite_domain
        except (IndexError, AttributeError):
            return False
