-- Business closures table: Holiday and special closure scheduling
-- Stores date ranges when the warehouse is closed

CREATE TABLE business_closures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Closure date range (inclusive)
    start_date date NOT NULL,
    end_date date NOT NULL,

    -- Optional reason for the closure
    reason text,

    -- Audit fields
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),

    -- Constraints
    CONSTRAINT valid_date_range CHECK (start_date <= end_date)
);

-- Enable Row Level Security
ALTER TABLE business_closures ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view closures (customers need to see when warehouse is closed)
CREATE POLICY "Anyone can view closures"
    ON business_closures
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Staff can insert closures
CREATE POLICY "Staff can insert closures"
    ON business_closures
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Staff can update closures
CREATE POLICY "Staff can update closures"
    ON business_closures
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Staff can delete closures
CREATE POLICY "Staff can delete closures"
    ON business_closures
    FOR DELETE
    TO authenticated
    USING (true);

-- Comments for documentation
COMMENT ON TABLE business_closures IS 'Scheduled closures for holidays and special events';
COMMENT ON COLUMN business_closures.start_date IS 'First day of closure (inclusive)';
COMMENT ON COLUMN business_closures.end_date IS 'Last day of closure (inclusive)';
COMMENT ON COLUMN business_closures.reason IS 'Optional reason displayed to customers (e.g., "Thanksgiving Holiday")';
