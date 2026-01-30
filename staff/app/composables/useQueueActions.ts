import { ref, readonly } from 'vue'
import { toast } from 'vue-sonner'
import type { SupabaseClient } from '@supabase/supabase-js'

export function useQueueActions() {
  // Cast to any to work around missing database types
  // TODO: Generate proper database types with `supabase gen types typescript`
  const client = useSupabaseClient() as SupabaseClient

  const pending = ref<Record<string, boolean>>({})

  async function assignGate(requestId: string, gateId: string): Promise<number> {
    pending.value[requestId] = true
    try {
      const { data, error } = await client.rpc('assign_to_queue', {
        p_request_id: requestId,
        p_gate_id: gateId
      })
      if (error) throw error
      toast.success('Request added to queue')
      return data as number
    } catch (e) {
      toast.error('Failed to assign gate')
      throw e
    } finally {
      pending.value[requestId] = false
    }
  }

  async function cancelRequest(requestId: string): Promise<void> {
    pending.value[requestId] = true
    try {
      const { error } = await client
        .from('pickup_requests')
        .update({
          status: 'cancelled',
          assigned_gate_id: null,
          queue_position: null
        })
        .eq('id', requestId)

      if (error) throw error
      toast.success('Request cancelled')
    } catch (e) {
      toast.error('Failed to cancel request')
      throw e
    } finally {
      pending.value[requestId] = false
    }
  }

  async function completeRequest(requestId: string): Promise<void> {
    pending.value[requestId] = true
    try {
      const { error } = await client
        .from('pickup_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          queue_position: null,
          assigned_gate_id: null,
        })
        .eq('id', requestId)

      if (error) throw error
      toast.success('Pickup marked complete')
    } catch (e) {
      toast.error('Failed to complete pickup')
      throw e
    } finally {
      pending.value[requestId] = false
    }
  }

  async function reorderQueue(gateId: string, requestIds: string[]): Promise<boolean> {
    try {
      const { error } = await client.rpc('reorder_queue', {
        p_gate_id: gateId,
        p_request_ids: requestIds
      })
      if (error) throw error
      toast.success('Queue reordered')
      return true
    } catch (e) {
      toast.error('Failed to reorder queue')
      return false
    }
  }

  async function setPriority(requestId: string): Promise<boolean> {
    pending.value[requestId] = true
    try {
      const { error } = await client.rpc('set_priority', {
        p_request_id: requestId
      })
      if (error) throw error
      toast.success('Marked as priority')
      return true
    } catch (e) {
      toast.error('Failed to set priority')
      return false
    } finally {
      pending.value[requestId] = false
    }
  }

  async function clearPriority(requestId: string): Promise<boolean> {
    pending.value[requestId] = true
    try {
      const { error } = await client
        .from('pickup_requests')
        .update({ is_priority: false })
        .eq('id', requestId)
      if (error) throw error
      toast.success('Priority removed')
      return true
    } catch (e) {
      toast.error('Failed to remove priority')
      return false
    } finally {
      pending.value[requestId] = false
    }
  }

  async function moveToGate(requestId: string, newGateId: string): Promise<number | null> {
    pending.value[requestId] = true
    try {
      const { data, error } = await client.rpc('move_to_gate', {
        p_request_id: requestId,
        p_new_gate_id: newGateId
      })
      if (error) throw error
      toast.success('Moved to new gate')
      return data as number
    } catch (e) {
      toast.error('Failed to move to gate')
      return null
    } finally {
      pending.value[requestId] = false
    }
  }

  async function startProcessing(requestId: string, gateId: string): Promise<string | null> {
    pending.value[requestId] = true
    try {
      const { data, error } = await client.rpc('start_processing', {
        p_request_id: requestId,
        p_gate_id: gateId
      })
      if (error) throw error
      toast.success('Processing started')
      return data as string  // Returns the processing_started_at timestamp
    } catch (e: any) {
      // Handle specific error messages from database function
      if (e.message?.includes('already has a processing request')) {
        toast.error('Gate already has an active pickup')
      } else if (e.message?.includes('not at position 1')) {
        toast.error('Only position 1 can start processing')
      } else {
        toast.error('Failed to start processing')
      }
      return null
    } finally {
      pending.value[requestId] = false
    }
  }

  async function revertToQueue(requestId: string): Promise<number | null> {
    pending.value[requestId] = true
    try {
      const { data, error } = await client.rpc('revert_to_queue', {
        p_request_id: requestId
      })
      if (error) throw error
      toast.success('Returned to queue')
      return data as number  // Returns the preserved queue_position
    } catch (e: any) {
      if (e.message?.includes('not in processing status')) {
        toast.error('Request is not being processed')
      } else {
        toast.error('Failed to return to queue')
      }
      return null
    } finally {
      pending.value[requestId] = false
    }
  }

  return {
    pending: readonly(pending),
    assignGate,
    cancelRequest,
    completeRequest,
    reorderQueue,
    setPriority,
    clearPriority,
    moveToGate,
    startProcessing,
    revertToQueue
  }
}
