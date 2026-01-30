import { ref, readonly } from 'vue'
import { toast } from 'vue-sonner'
import type { SupabaseClient } from '@supabase/supabase-js'
import { PICKUP_STATUS } from '#shared/types/pickup-request'
import type { PickupRequest } from '#shared/types/pickup-request'
import type { GateWithCount } from '#shared/types/gate'

export function useQueueActions() {
  const client = useSupabaseClient() as SupabaseClient
  const queueStore = useQueueStore()
  const gatesStore = useGatesStore()

  const pending = ref<Record<string, boolean>>({})

  // === Data Fetching ===
  async function fetchRequests(): Promise<void> {
    queueStore.loading = true
    try {
      const { data, error } = await client
        .from('pickup_requests')
        .select('id, sales_order_number, company_name, customer_email, status, email_flagged, assigned_gate_id, queue_position, is_priority, processing_started_at, created_at, gate:gates(id, gate_number)')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform Supabase array response to expected shape
      // Supabase returns joined relations as arrays, we need single object or null
      const requests = (data ?? []).map(row => ({
        ...row,
        gate: Array.isArray(row.gate) ? (row.gate[0] ?? null) : row.gate
      })) as PickupRequest[]

      queueStore.setRequests(requests)
    } finally {
      queueStore.loading = false
    }
  }

  async function fetchGates(): Promise<void> {
    gatesStore.loading = true
    try {
      const { data, error } = await client
        .from('gates')
        .select('id, gate_number, is_active')
        .order('gate_number')

      if (error) throw error

      // Get queue counts per gate
      const { data: counts } = await client
        .from('pickup_requests')
        .select('assigned_gate_id')
        .eq('status', PICKUP_STATUS.IN_QUEUE)

      const countMap: Record<string, number> = {}
      for (const row of counts ?? []) {
        const gateId = (row as { assigned_gate_id: string | null }).assigned_gate_id
        if (gateId) {
          countMap[gateId] = (countMap[gateId] || 0) + 1
        }
      }

      const gatesWithCount: GateWithCount[] = (data ?? []).map(g => ({
        ...g,
        queue_count: countMap[g.id] || 0
      }))

      gatesStore.setGates(gatesWithCount)
    } finally {
      gatesStore.loading = false
    }
  }

  // Refresh both stores
  async function refresh(): Promise<void> {
    await Promise.all([fetchRequests(), fetchGates()])
  }

  // === Queue Actions ===
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
          status: PICKUP_STATUS.CANCELLED,
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

  async function completeRequest(requestId: string, gateId?: string): Promise<void> {
    pending.value[requestId] = true
    try {
      const { error } = await client
        .from('pickup_requests')
        .update({
          status: PICKUP_STATUS.COMPLETED,
          completed_at: new Date().toISOString(),
          queue_position: null,
          assigned_gate_id: null,
          processing_started_at: null,
        })
        .eq('id', requestId)

      if (error) throw error

      // Compact queue positions if gate was provided (PROC-05)
      if (gateId) {
        const { error: compactError } = await client.rpc('compact_queue_positions', {
          p_gate_id: gateId
        })
        if (compactError) {
          console.error('Failed to compact queue positions:', compactError)
          // Don't throw - pickup is already completed, this is cleanup
        }
      }

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
    // Data fetching
    fetchRequests,
    fetchGates,
    refresh,
    // Actions
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
