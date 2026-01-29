-- Advanced queue management functions for atomic operations
-- Provides bulk reordering, priority insertion, and cross-gate transfer
-- All functions use SECURITY DEFINER for atomic operations across RLS boundaries

-- reorder_queue: Atomically reorders queue positions based on array order
-- Uses UNNEST WITH ORDINALITY to assign positions 1, 2, 3... based on array index
-- Only updates requests that are in_queue status AND assigned to the specified gate
CREATE OR REPLACE FUNCTION reorder_queue(
    p_gate_id uuid,
    p_request_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update positions based on array order
    -- UNNEST WITH ORDINALITY gives us (id, position) pairs where ordinality is 1-based
    UPDATE pickup_requests pr
    SET queue_position = arr.new_pos
    FROM (
        SELECT id, ordinality::integer AS new_pos
        FROM UNNEST(p_request_ids) WITH ORDINALITY AS t(id, ordinality)
    ) arr
    WHERE pr.id = arr.id
      AND pr.assigned_gate_id = p_gate_id
      AND pr.status = 'in_queue';
END;
$$;

-- Grant execute permission to authenticated users (staff)
GRANT EXECUTE ON FUNCTION reorder_queue(uuid, uuid[]) TO authenticated;

COMMENT ON FUNCTION reorder_queue IS 'Atomically reorders queue positions for a gate based on provided ID array order';


-- set_priority: Moves a request to position 2 (behind current service) and marks as priority
-- Shifts all positions >= 2 and < current position up by 1 to make room
-- Raises exception if request is not in_queue status
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

    -- Shift positions 2 through (current_pos - 1) up by 1 to make room at position 2
    UPDATE pickup_requests
    SET queue_position = queue_position + 1
    WHERE assigned_gate_id = v_gate_id
      AND status = 'in_queue'
      AND queue_position >= 2
      AND queue_position < v_current_pos;

    -- Move request to position 2 and mark as priority
    UPDATE pickup_requests
    SET queue_position = 2, is_priority = true
    WHERE id = p_request_id;
END;
$$;

-- Grant execute permission to authenticated users (staff)
GRANT EXECUTE ON FUNCTION set_priority(uuid) TO authenticated;

COMMENT ON FUNCTION set_priority IS 'Moves a queued request to position 2 (behind current service) and marks as priority';


-- move_to_gate: Transfers a request from one gate to another
-- Calculates new position as MAX(queue_position) + 1 for the new gate
-- Compacts old gate positions (closes gap left by moved request)
-- Returns the new position number
-- Raises exception if request is not in_queue status
CREATE OR REPLACE FUNCTION move_to_gate(
    p_request_id uuid,
    p_new_gate_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_gate_id uuid;
    v_old_pos integer;
    v_new_pos integer;
BEGIN
    -- Get current assignment
    SELECT assigned_gate_id, queue_position
    INTO v_old_gate_id, v_old_pos
    FROM pickup_requests
    WHERE id = p_request_id AND status = 'in_queue';

    IF v_old_gate_id IS NULL THEN
        RAISE EXCEPTION 'Request not in queue';
    END IF;

    -- If already at target gate, do nothing
    IF v_old_gate_id = p_new_gate_id THEN
        RETURN v_old_pos;
    END IF;

    -- Calculate new position at end of new gate's queue
    SELECT COALESCE(MAX(queue_position), 0) + 1
    INTO v_new_pos
    FROM pickup_requests
    WHERE assigned_gate_id = p_new_gate_id AND status = 'in_queue';

    -- Update request to new gate and position
    UPDATE pickup_requests
    SET assigned_gate_id = p_new_gate_id, queue_position = v_new_pos
    WHERE id = p_request_id;

    -- Compact old gate's positions (close the gap)
    UPDATE pickup_requests
    SET queue_position = queue_position - 1
    WHERE assigned_gate_id = v_old_gate_id
      AND status = 'in_queue'
      AND queue_position > v_old_pos;

    RETURN v_new_pos;
END;
$$;

-- Grant execute permission to authenticated users (staff)
GRANT EXECUTE ON FUNCTION move_to_gate(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION move_to_gate IS 'Transfers a queued request to a different gate, returning the new position';
