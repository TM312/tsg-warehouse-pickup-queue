-- Fix reorder_queue function to avoid unique constraint violations
-- Uses two-step approach: first set positions to negative, then to final values

CREATE OR REPLACE FUNCTION reorder_queue(
    p_gate_id uuid,
    p_request_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Step 1: Set all positions to negative values (based on final position)
    -- This clears the way for reassignment without conflicts
    UPDATE pickup_requests pr
    SET queue_position = -arr.new_pos
    FROM (
        SELECT id, ordinality::integer AS new_pos
        FROM UNNEST(p_request_ids) WITH ORDINALITY AS t(id, ordinality)
    ) arr
    WHERE pr.id = arr.id
      AND pr.assigned_gate_id = p_gate_id
      AND pr.status = 'in_queue';

    -- Step 2: Convert negative positions to positive (final values)
    UPDATE pickup_requests
    SET queue_position = -queue_position
    WHERE assigned_gate_id = p_gate_id
      AND status = 'in_queue'
      AND queue_position < 0;
END;
$$;

COMMENT ON FUNCTION reorder_queue IS 'Atomically reorders queue positions for a gate based on provided ID array order (uses two-step update to avoid conflicts)';
