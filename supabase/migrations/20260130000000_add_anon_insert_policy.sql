-- Allow anonymous customers to submit pickup requests
-- Constrains insertable fields to prevent privilege escalation

-- Grant INSERT permission to anon role
GRANT INSERT ON pickup_requests TO anon;

-- Policy: Customers can submit pickup requests with constraints
CREATE POLICY "Customers can submit pickup requests"
  ON pickup_requests
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Must be pending status (cannot skip approval process)
    status = 'pending'
    -- Cannot assign themselves to a gate
    AND assigned_gate_id IS NULL
    -- Cannot set queue position
    AND queue_position IS NULL
    -- Cannot mark as priority
    AND is_priority = false
    -- Email should not be pre-verified
    AND email_verified = false
    -- completed_at should not be set
    AND completed_at IS NULL
  );
