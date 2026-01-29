-- Queue management functions for atomic operations
-- Prevents race conditions when multiple staff members assign requests to queues

-- assign_to_queue: Atomically assigns a pickup request to a gate's queue
-- Returns the new queue position, or NULL if the request couldn't be assigned
-- (e.g., if it's not in pending/approved status)
CREATE OR REPLACE FUNCTION assign_to_queue(p_request_id uuid, p_gate_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_position integer;
BEGIN
    -- Single atomic UPDATE that:
    -- 1. Changes status to 'in_queue'
    -- 2. Sets the assigned gate
    -- 3. Calculates next queue position for that gate
    -- Only succeeds if current status allows transition
    UPDATE pickup_requests
    SET
        status = 'in_queue',
        assigned_gate_id = p_gate_id,
        queue_position = (
            SELECT COALESCE(MAX(queue_position), 0) + 1
            FROM pickup_requests
            WHERE assigned_gate_id = p_gate_id
              AND status = 'in_queue'
        )
    WHERE id = p_request_id
      AND status IN ('pending', 'approved')
    RETURNING queue_position INTO v_new_position;

    RETURN v_new_position;
END;
$$;

-- Grant execute permission to authenticated users (staff)
GRANT EXECUTE ON FUNCTION assign_to_queue(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION assign_to_queue IS 'Atomically assigns a pickup request to a gate queue, returning the new position';
