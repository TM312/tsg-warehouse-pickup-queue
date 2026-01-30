-- Compact queue positions at a gate after a pickup completes
-- Shifts all positions down by 1 (position 2 -> 1, 3 -> 2, etc.)
-- PROC-05: Auto-advance to next pickup after completing current

CREATE OR REPLACE FUNCTION compact_queue_positions(p_gate_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Shift all queue positions down by 1 for pickups at this gate
    -- Only affects in_queue pickups (processing keeps position until complete)
    UPDATE pickup_requests
    SET queue_position = queue_position - 1
    WHERE assigned_gate_id = p_gate_id
      AND status = 'in_queue'
      AND queue_position IS NOT NULL
      AND queue_position > 1;
END;
$$;

-- Grant execute permission to authenticated users (staff)
GRANT EXECUTE ON FUNCTION compact_queue_positions(uuid) TO authenticated;
