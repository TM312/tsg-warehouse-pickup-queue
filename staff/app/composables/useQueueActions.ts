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
          completed_at: new Date().toISOString()
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

  return {
    pending: readonly(pending),
    assignGate,
    cancelRequest,
    completeRequest,
    reorderQueue,
    setPriority,
    moveToGate
  }
}
