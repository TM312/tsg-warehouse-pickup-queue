from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class OrderValidationRequest(BaseModel):
    """Request body for order validation."""
    order_number: str = Field(..., min_length=1, max_length=50, description="NetSuite sales order number (e.g., SO-12345)")
    email: EmailStr = Field(..., description="Customer email for domain verification")


class OrderDetails(BaseModel):
    """Order details retrieved from NetSuite."""
    order_number: str
    company_name: str
    item_count: int
    po_number: Optional[str] = None
    status: str
    status_name: str
    email_match: bool = Field(..., description="True if submitted email domain matches NetSuite customer")
    valid_for_pickup: bool = Field(..., description="True if order status allows pickup")
    from_cache: bool = Field(default=False, description="True if data was served from cache")


class OrderValidationResponse(BaseModel):
    """Successful validation response."""
    success: bool = True
    order: OrderDetails


class ErrorResponse(BaseModel):
    """Error response with user-friendly message."""
    success: bool = False
    error: str
    error_code: str
    reference_id: Optional[str] = None  # For debugging
