-- Fix set_priority function to avoid unique constraint violations
-- Uses negative values as intermediate step when shifting positions

CREATE OR REPLACE FUNCTION set_priority(p_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_gate_id uuid;
    v_current_pos integer;
BEGIN
    -- Get current gate and position
    SELECT assigned_gate_id, queue_position
    INTO v_gate_id, v_current_pos
    FROM pickup_requests
    WHERE id = p_request_id AND status = 'in_queue';

    IF v_gate_id IS NULL THEN
        RAISE EXCEPTION 'Request not in queue';
    END IF;

    -- If already at position 1 or 2, just mark as priority
    IF v_current_pos <= 2 THEN
        UPDATE pickup_requests
        SET is_priority = true
        WHERE id = p_request_id;
        RETURN;
    END IF;

    -- Step 1: Move target request out of the way (to a high negative number)
    UPDATE pickup_requests
    SET queue_position = -9999
    WHERE id = p_request_id;

    -- Step 2: Shift positions 2 through (current_pos - 1) to NEGATIVE of new position
    -- This avoids conflicts: 2→-3, 3→-4, etc.
    UPDATE pickup_requests
    SET queue_position = -(queue_position + 1)
    WHERE assigned_gate_id = v_gate_id
      AND status = 'in_queue'
      AND queue_position >= 2
      AND queue_position < v_current_pos;

    -- Step 3: Flip negatives back to positive: -3→3, -4→4, etc.
    UPDATE pickup_requests
    SET queue_position = -queue_position
    WHERE assigned_gate_id = v_gate_id
      AND status = 'in_queue'
      AND queue_position < 0
      AND id != p_request_id;  -- Don't touch the target yet

    -- Step 4: Set target to position 2 and mark as priority
    UPDATE pickup_requests
    SET queue_position = 2, is_priority = true
    WHERE id = p_request_id;
END;
$$;

COMMENT ON FUNCTION set_priority IS 'Moves a queued request to position 2 (behind current service) and marks as priority';
