-- Processing status support for gate operator workflow
-- Adds 'processing' status between 'in_queue' and 'completed'
-- Enables explicit acceptance of pickups by gate operators

-- ============================================================================
-- SCHEMA CHANGES
-- ============================================================================

-- Add processing_started_at column to track when pickup entered processing state
ALTER TABLE pickup_requests
ADD COLUMN processing_started_at timestamptz;

COMMENT ON COLUMN pickup_requests.processing_started_at
IS 'Timestamp when pickup entered processing state';

-- Update status CHECK constraint to include 'processing'
-- Must drop and recreate since we cannot modify existing CHECK constraints
ALTER TABLE pickup_requests
DROP CONSTRAINT pickup_requests_status_check;

ALTER TABLE pickup_requests
ADD CONSTRAINT pickup_requests_status_check
CHECK (status IN ('pending', 'approved', 'in_queue', 'processing', 'completed', 'cancelled'));

-- ============================================================================
-- INDEX CHANGES
-- ============================================================================

-- Update partial index to include processing requests
-- Processing requests retain queue_position for potential revert back to queue
DROP INDEX IF EXISTS idx_pickup_requests_queue;
CREATE INDEX idx_pickup_requests_queue
    ON pickup_requests (assigned_gate_id, queue_position)
    WHERE status IN ('in_queue', 'processing');

-- Index for processing timestamp queries (metrics, duration display)
CREATE INDEX idx_pickup_requests_processing_started
    ON pickup_requests (processing_started_at)
    WHERE status = 'processing';

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- start_processing: Atomically transitions a request from 'in_queue' to 'processing'
-- Constraints:
--   - Only position 1 can start processing (customer at front of queue)
--   - Only one pickup can be processing per gate at a time
--   - Request must be in 'in_queue' status
-- Returns the processing_started_at timestamp on success
-- Raises exception if preconditions not met
CREATE OR REPLACE FUNCTION start_processing(p_request_id uuid, p_gate_id uuid)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_processing_started_at timestamptz;
    v_existing_processing integer;
    v_request_status text;
    v_request_gate uuid;
    v_request_position integer;
BEGIN
    -- Check if gate already has a request in processing status
    SELECT COUNT(*)
    INTO v_existing_processing
    FROM pickup_requests
    WHERE assigned_gate_id = p_gate_id
      AND status = 'processing';

    IF v_existing_processing > 0 THEN
        RAISE EXCEPTION 'Gate already has a request in processing status';
    END IF;

    -- Get request details
    SELECT status, assigned_gate_id, queue_position
    INTO v_request_status, v_request_gate, v_request_position
    FROM pickup_requests
    WHERE id = p_request_id;

    IF v_request_status IS NULL THEN
        RAISE EXCEPTION 'Request not found';
    END IF;

    IF v_request_status != 'in_queue' THEN
        RAISE EXCEPTION 'Request must be in_queue status to start processing';
    END IF;

    IF v_request_gate != p_gate_id THEN
        RAISE EXCEPTION 'Request is not assigned to this gate';
    END IF;

    IF v_request_position != 1 THEN
        RAISE EXCEPTION 'Only position 1 can start processing';
    END IF;

    -- Atomically update to processing status
    v_processing_started_at := now();

    UPDATE pickup_requests
    SET status = 'processing',
        processing_started_at = v_processing_started_at
    WHERE id = p_request_id;

    RETURN v_processing_started_at;
END;
$$;

-- Grant execute permission to authenticated users (staff)
GRANT EXECUTE ON FUNCTION start_processing(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION start_processing IS 'Atomically transitions position 1 request from in_queue to processing status';


-- revert_to_queue: Returns a processing request back to in_queue status
-- Preserves original queue_position for fairness (customer keeps their spot)
-- Constraints:
--   - Request must be in 'processing' status
-- Returns the preserved queue_position on success
-- Raises exception if request is not in processing status
CREATE OR REPLACE FUNCTION revert_to_queue(p_request_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_request_status text;
    v_queue_position integer;
BEGIN
    -- Get request details
    SELECT status, queue_position
    INTO v_request_status, v_queue_position
    FROM pickup_requests
    WHERE id = p_request_id;

    IF v_request_status IS NULL THEN
        RAISE EXCEPTION 'Request not found';
    END IF;

    IF v_request_status != 'processing' THEN
        RAISE EXCEPTION 'Request must be in processing status to revert to queue';
    END IF;

    -- Atomically revert to in_queue status
    UPDATE pickup_requests
    SET status = 'in_queue',
        processing_started_at = NULL
    WHERE id = p_request_id;

    RETURN v_queue_position;
END;
$$;

-- Grant execute permission to authenticated users (staff)
GRANT EXECUTE ON FUNCTION revert_to_queue(uuid) TO authenticated;

COMMENT ON FUNCTION revert_to_queue IS 'Returns a processing request back to in_queue status, preserving original queue position';
