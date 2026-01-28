-- Row Level Security Policies
-- All policies specify target role (TO authenticated/anon) for performance optimization
-- This allows PostgreSQL to skip policy evaluation for irrelevant roles

-- =============================================================================
-- GATES POLICIES
-- =============================================================================

-- Anyone (including anonymous users) can view active gates
CREATE POLICY "Anyone can view active gates"
  ON gates
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Staff can view all gates (including inactive)
CREATE POLICY "Staff can view all gates"
  ON gates
  FOR SELECT
  TO authenticated
  USING (true);

-- Staff can insert new gates
CREATE POLICY "Staff can insert gates"
  ON gates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Staff can update gates
CREATE POLICY "Staff can update gates"
  ON gates
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Staff can delete gates
CREATE POLICY "Staff can delete gates"
  ON gates
  FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- PICKUP_REQUESTS POLICIES
-- =============================================================================

-- Staff can view all requests
CREATE POLICY "Staff can view all requests"
  ON pickup_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Staff can insert new requests
CREATE POLICY "Staff can insert requests"
  ON pickup_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Staff can update requests
CREATE POLICY "Staff can update requests"
  ON pickup_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Staff can delete requests
CREATE POLICY "Staff can delete requests"
  ON pickup_requests
  FOR DELETE
  TO authenticated
  USING (true);

-- Customers (anonymous) can view pickup requests
-- Note: In v1, customer view will be scoped by session token in application layer
-- RLS allows read access; column-level restrictions via views/functions in later phase
CREATE POLICY "Customers can view requests"
  ON pickup_requests
  FOR SELECT
  TO anon
  USING (true);

-- =============================================================================
-- BUSINESS_HOURS POLICIES
-- =============================================================================

-- Anyone can view business hours
CREATE POLICY "Anyone can view business hours"
  ON business_hours
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Staff can insert business hours
CREATE POLICY "Staff can insert business hours"
  ON business_hours
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Staff can update business hours
CREATE POLICY "Staff can update business hours"
  ON business_hours
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Staff can delete business hours
CREATE POLICY "Staff can delete business hours"
  ON business_hours
  FOR DELETE
  TO authenticated
  USING (true);
