import os
from typing import Tuple
from netsuite import NetSuite, Config, TokenAuth

from models.schemas import OrderDetails

# Valid statuses for pickup (from RESEARCH.md)
VALID_PICKUP_STATUSES = {"B", "C", "D", "E"}  # Pending Fulfillment, Partially Fulfilled, Pending Billing variants
FLAGGED_PICKUP_STATUSES = {"F"}  # Billed - may already be shipped


class OrderNotFoundError(Exception):
    """Raised when order number doesn't exist in NetSuite."""
    pass


class NetSuiteError(Exception):
    """Raised when NetSuite API fails."""
    pass


class NetSuiteService:
    """Service for NetSuite order validation."""

    def __init__(self):
        self.config = Config(
            account=os.environ["NETSUITE_ACCOUNT_ID"],
            auth=TokenAuth(
                consumer_key=os.environ["NETSUITE_CONSUMER_KEY"],
                consumer_secret=os.environ["NETSUITE_CONSUMER_SECRET"],
                token_id=os.environ["NETSUITE_TOKEN_ID"],
                token_secret=os.environ["NETSUITE_TOKEN_SECRET"],
            ),
        )

    async def find_order(self, order_number: str, customer_email: str) -> Tuple[OrderDetails, str]:
        """
        Find a sales order by order number and validate customer email.

        Args:
            order_number: NetSuite sales order number (tranid)
            customer_email: Email submitted by customer for domain verification

        Returns:
            Tuple of (OrderDetails with order info and email match status, netsuite_email for caching)

        Raises:
            OrderNotFoundError: If order doesn't exist
            NetSuiteError: If NetSuite API fails
        """
        try:
            ns = NetSuite(self.config)
            async with ns:
                # SuiteQL query - use transaction table with type filter (Pitfall 2)
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
                        (SELECT COUNT(*) FROM transactionLine tl WHERE tl.transaction = t.id AND tl.mainline = 'F') AS itemCount
                    FROM transaction t
                    JOIN customer c ON t.entity = c.id
                    WHERE t.type = 'SalesOrd'
                    AND t.tranid = :orderNumber
                """

                response = await ns.rest_api.request(
                    "POST",
                    "/query/v1/suiteql",
                    json={"q": query.replace(":orderNumber", f"'{order_number}'")},
                    headers={"Prefer": "transient"},
                    params={"limit": "1"}
                )

                items = response.get("items", [])
                if not items:
                    raise OrderNotFoundError(f"Order {order_number} not found")

                order_data = items[0]

                # Get NetSuite customer email for caching
                netsuite_email = order_data.get("customerEmail") or ""

                # Check email domain match
                email_match = self._check_email_domain_match(customer_email, netsuite_email)

                # Check if status is valid for pickup
                status_code = order_data.get("status", "")
                valid_for_pickup = status_code in VALID_PICKUP_STATUSES

                order_details = OrderDetails(
                    order_number=order_data.get("tranid", order_number),
                    company_name=order_data.get("companyname", "Unknown"),
                    item_count=int(order_data.get("itemCount", 0)),
                    po_number=order_data.get("poNumber"),
                    status=status_code,
                    status_name=order_data.get("statusName", "Unknown"),
                    email_match=email_match,
                    valid_for_pickup=valid_for_pickup,
                    from_cache=False
                )

                return order_details, netsuite_email

        except OrderNotFoundError:
            raise
        except Exception as e:
            raise NetSuiteError(f"NetSuite API error: {str(e)}")

    def _check_email_domain_match(self, submitted_email: str, netsuite_email: str) -> bool:
        """
        Check if submitted email domain matches NetSuite customer email domain.

        Handles:
        - Null/empty NetSuite emails (returns False, customer flagged)
        - Case-insensitive comparison
        - Exact domain match (no subdomain flexibility for now)
        """
        if not netsuite_email:
            return False

        try:
            submitted_domain = submitted_email.lower().split("@")[1]
            netsuite_domain = netsuite_email.lower().split("@")[1]
            return submitted_domain == netsuite_domain
        except (IndexError, AttributeError):
            return False
