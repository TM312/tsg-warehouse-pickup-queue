-- Fix queue_position constraint to only apply to in_queue status
-- The original constraint was not partial, causing conflicts during reorder

-- Step 1: Clean up existing data - clear queue_position for completed/cancelled requests
UPDATE pickup_requests
SET queue_position = NULL, assigned_gate_id = NULL
WHERE status IN ('completed', 'cancelled')
  AND queue_position IS NOT NULL;

-- Step 2: Drop the non-partial constraint
ALTER TABLE pickup_requests DROP CONSTRAINT IF EXISTS unique_queue_position;

-- Step 3: The partial index already exists from original migration, but recreate to be sure
DROP INDEX IF EXISTS idx_queue_position_in_queue;
CREATE UNIQUE INDEX idx_queue_position_in_queue
    ON pickup_requests (assigned_gate_id, queue_position)
    WHERE status = 'in_queue';

COMMENT ON INDEX idx_queue_position_in_queue IS 'Ensures unique queue positions per gate, only for in_queue status';
