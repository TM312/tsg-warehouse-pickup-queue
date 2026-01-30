import type { GateWithCount } from '#shared/types/gate'

export const useGatesStore = defineStore('gates', () => {
  // === State ===
  const gates = ref<GateWithCount[]>([])
  const loading = ref(false)
  const lastUpdated = ref<Date | null>(null)

  // === Getters ===
  const activeGates = computed(() =>
    gates.value.filter(g => g.is_active)
  )

  // Sorted by gate number for consistent ordering
  const sortedGates = computed(() =>
    [...gates.value].sort((a, b) => a.gate_number - b.gate_number)
  )

  const sortedActiveGates = computed(() =>
    [...activeGates.value].sort((a, b) => a.gate_number - b.gate_number)
  )

  // === Actions ===
  function setGates(data: GateWithCount[]) {
    gates.value = data
    lastUpdated.value = new Date()
  }

  function updateGate(id: string, updates: Partial<GateWithCount>) {
    const index = gates.value.findIndex(g => g.id === id)
    if (index !== -1) {
      gates.value[index] = Object.assign({}, gates.value[index], updates) as GateWithCount
      lastUpdated.value = new Date()
    }
  }

  function addGate(gate: GateWithCount) {
    gates.value.push(gate)
    // Re-sort after adding
    gates.value.sort((a, b) => a.gate_number - b.gate_number)
    lastUpdated.value = new Date()
  }

  // Helper to get gate by ID
  function getGateById(id: string): GateWithCount | undefined {
    return gates.value.find(g => g.id === id)
  }

  // Return everything for DevTools visibility
  return {
    // State
    gates,
    loading,
    lastUpdated,
    // Getters
    activeGates,
    sortedGates,
    sortedActiveGates,
    // Actions
    setGates,
    updateGate,
    addGate,
    getGateById,
  }
})
