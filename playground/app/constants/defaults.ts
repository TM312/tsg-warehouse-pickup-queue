import type { Gate } from '@/types/gate'
import type { SimulationSpeed } from '@/types/simulation'

export const DEFAULT_GATE_COUNT = 3

export const DEFAULT_GATES: Gate[] = Array.from({ length: DEFAULT_GATE_COUNT }, (_, i) => ({
  id: `gate-${i + 1}`,
  gate_number: i + 1,
  is_active: true,
}))

export const DEFAULT_PROCESSING_DURATION_MS = 120_000

export const DEFAULT_SIMULATION_SPEED: SimulationSpeed = 1

export const SEED_COMPANIES = [
  'Acme Corp',
  'Wayne Enterprises',
  'Stark Industries',
  'Umbrella Corp',
  'Cyberdyne Systems',
  'Initech',
  'Globex Corporation',
  'Soylent Corp',
  'Massive Dynamic',
  'Aperture Science',
]

export const SEED_ORDER_PREFIXES = ['SO', 'PO', 'WO'] as const
