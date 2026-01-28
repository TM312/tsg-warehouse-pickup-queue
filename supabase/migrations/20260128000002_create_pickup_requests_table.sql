-- Pickup requests table: Core entity for the queue system
-- Tracks customer pickup requests through their lifecycle

CREATE TABLE pickup_requests (
    -- Primary identification
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Customer-provided information
    sales_order_number text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text,  -- Optional phone number

    -- NetSuite cache fields (populated after verification)
    company_name text,
    item_count integer,
    po_number text,

    -- Email verification status
    email_verified boolean NOT NULL DEFAULT false,
    email_flagged boolean NOT NULL DEFAULT false,  -- True if email doesn't match NetSuite record

    -- Request status lifecycle
    -- pending: Submitted, awaiting staff approval
    -- approved: Staff approved, customer notified to come
    -- in_queue: Customer has arrived, actively waiting
    -- completed: Pickup finished
    -- cancelled: Request cancelled by staff or customer
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'in_queue', 'completed', 'cancelled')),

    -- Queue management
    assigned_gate_id uuid REFERENCES gates(id),
    queue_position integer,  -- Only set when status = 'in_queue'
    is_priority boolean NOT NULL DEFAULT false,

    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz,
    completed_at timestamptz,

    -- Constraints
    -- Each gate can only have one customer at each queue position
    CONSTRAINT unique_queue_position UNIQUE (assigned_gate_id, queue_position)
);

-- Automatic updated_at trigger using moddatetime extension
CREATE TRIGGER pickup_requests_updated_at
    BEFORE UPDATE ON pickup_requests
    FOR EACH ROW
    EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Indexes for common queries
-- Status lookups (staff dashboard filtering)
CREATE INDEX idx_pickup_requests_status ON pickup_requests (status);

-- Gate assignment lookups
CREATE INDEX idx_pickup_requests_gate ON pickup_requests (assigned_gate_id);

-- Queue position queries (ordered queue display)
-- Partial index only for in_queue status since queue_position is only meaningful there
CREATE INDEX idx_pickup_requests_queue
    ON pickup_requests (assigned_gate_id, queue_position)
    WHERE status = 'in_queue';

-- Sales order lookups (for duplicate checking)
CREATE INDEX idx_pickup_requests_sales_order ON pickup_requests (sales_order_number);

-- Comments for documentation
COMMENT ON TABLE pickup_requests IS 'Customer pickup requests that flow through the queue system';
COMMENT ON COLUMN pickup_requests.sales_order_number IS 'NetSuite sales order number provided by customer';
COMMENT ON COLUMN pickup_requests.email_verified IS 'True if customer clicked verification link';
COMMENT ON COLUMN pickup_requests.email_flagged IS 'True if submitted email differs from NetSuite record';
COMMENT ON COLUMN pickup_requests.queue_position IS 'Position in gate queue (1 = next up), only set when in_queue';
COMMENT ON COLUMN pickup_requests.is_priority IS 'Priority customers move to front of queue';
