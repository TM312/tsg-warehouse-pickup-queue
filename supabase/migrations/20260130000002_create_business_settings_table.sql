-- Business settings table: Key-value store for business configuration
-- Used for manual override and other business settings

CREATE TABLE business_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id)
);

-- Automatic updated_at trigger using moddatetime extension
CREATE TRIGGER business_settings_updated_at
    BEFORE UPDATE ON business_settings
    FOR EACH ROW
    EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Initial settings
INSERT INTO business_settings (key, value) VALUES
    ('manual_override', '{"active": false, "expiresAt": null}');

-- Enable Row Level Security
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view settings (customers need to check override status)
CREATE POLICY "Anyone can view settings"
    ON business_settings
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Staff can insert settings
CREATE POLICY "Staff can insert settings"
    ON business_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Staff can update settings
CREATE POLICY "Staff can update settings"
    ON business_settings
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Staff can delete settings
CREATE POLICY "Staff can delete settings"
    ON business_settings
    FOR DELETE
    TO authenticated
    USING (true);

-- Comments for documentation
COMMENT ON TABLE business_settings IS 'Key-value store for business configuration settings';
COMMENT ON COLUMN business_settings.key IS 'Setting identifier (e.g., "manual_override")';
COMMENT ON COLUMN business_settings.value IS 'JSON value for the setting';
