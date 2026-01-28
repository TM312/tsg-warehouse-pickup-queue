-- Gates table: Physical pickup gates at the warehouse
-- Each gate can serve one customer at a time

CREATE TABLE gates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    gate_number integer NOT NULL UNIQUE,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz
);

-- Automatic updated_at trigger using moddatetime extension
CREATE TRIGGER gates_updated_at
    BEFORE UPDATE ON gates
    FOR EACH ROW
    EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Index for active gates lookup (used when assigning customers to gates)
CREATE INDEX idx_gates_is_active ON gates (is_active) WHERE is_active = true;

-- Comment for documentation
COMMENT ON TABLE gates IS 'Physical pickup gates at the warehouse where customers receive their orders';
COMMENT ON COLUMN gates.gate_number IS 'Display number shown to customers (1, 2, 3, etc.)';
COMMENT ON COLUMN gates.is_active IS 'Whether this gate is currently accepting customers';
