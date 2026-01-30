import { ref, readonly } from 'vue'
import { toast } from 'vue-sonner'
import type { SupabaseClient } from '@supabase/supabase-js'
import { PICKUP_STATUS } from '#shared/types/pickup-request'

export function useGateManagement() {
  const client = useSupabaseClient() as SupabaseClient
  const gatesStore = useGatesStore()

  const pending = ref(false)

  async function createGate(gateNumber: number): Promise<string | null> {
    pending.value = true
    try {
      const { data, error } = await client
        .from('gates')
        .insert({ gate_number: gateNumber })
        .select('id, gate_number, is_active')
        .single()

      if (error) throw error

      // Add to store with queue_count of 0 (new gate has no queue)
      gatesStore.addGate({ ...data, queue_count: 0 })

      toast.success(`Gate ${gateNumber} created`)
      return data.id as string
    } catch (e: unknown) {
      const err = e as { code?: string }
      if (err.code === '23505') {
        toast.error(`Gate ${gateNumber} already exists`)
      } else {
        toast.error('Failed to create gate')
      }
      return null
    } finally {
      pending.value = false
    }
  }

  async function toggleGateActive(gateId: string, isActive: boolean): Promise<boolean> {
    pending.value = true
    try {
      // If disabling, check for customers in queue
      if (!isActive) {
        const { count } = await client
          .from('pickup_requests')
          .select('id', { count: 'exact', head: true })
          .eq('assigned_gate_id', gateId)
          .eq('status', PICKUP_STATUS.IN_QUEUE)

        if (count && count > 0) {
          toast.error('Cannot disable gate with customers in queue')
          return false
        }
      }

      const { error } = await client
        .from('gates')
        .update({ is_active: isActive })
        .eq('id', gateId)

      if (error) throw error

      // Update store
      gatesStore.updateGate(gateId, { is_active: isActive })

      toast.success(isActive ? 'Gate enabled' : 'Gate disabled')
      return true
    } catch (e) {
      toast.error(`Failed to ${isActive ? 'enable' : 'disable'} gate`)
      return false
    } finally {
      pending.value = false
    }
  }

  return {
    pending: readonly(pending),
    createGate,
    toggleGateActive,
  }
}
