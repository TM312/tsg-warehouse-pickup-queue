-- Business hours table: Weekly schedule configuration
-- Controls when the pickup service is available

CREATE TABLE business_hours (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Day of week (0 = Sunday, 6 = Saturday, matching JavaScript Date.getDay())
    day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),

    -- Operating hours
    open_time time NOT NULL,
    close_time time NOT NULL,

    -- Closed flag (overrides open/close times)
    is_closed boolean NOT NULL DEFAULT false,

    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz,

    -- Constraints
    -- Only one entry per day of week
    CONSTRAINT unique_day UNIQUE (day_of_week),

    -- Validate that open_time < close_time when not closed
    -- (when is_closed = true, the times don't matter)
    CONSTRAINT valid_hours CHECK (open_time < close_time OR is_closed = true)
);

-- Automatic updated_at trigger using moddatetime extension
CREATE TRIGGER business_hours_updated_at
    BEFORE UPDATE ON business_hours
    FOR EACH ROW
    EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Comments for documentation
COMMENT ON TABLE business_hours IS 'Weekly business hours configuration for pickup service';
COMMENT ON COLUMN business_hours.day_of_week IS '0 = Sunday through 6 = Saturday (matches JS Date.getDay())';
COMMENT ON COLUMN business_hours.is_closed IS 'If true, pickup service is closed regardless of times';
