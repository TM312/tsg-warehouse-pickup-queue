import { ref, readonly } from 'vue'
import { toast } from 'vue-sonner'

export function useQueueActions() {
  const client = useSupabaseClient()
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

  return {
    pending: readonly(pending),
    assignGate,
    cancelRequest,
    completeRequest
  }
}
