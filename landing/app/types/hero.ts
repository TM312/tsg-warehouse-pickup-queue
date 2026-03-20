export interface TrustBarItem {
  text: string
}

export interface MockupQueueEntry {
  company: string
  order: string
  status: 'waiting' | 'called' | 'loading' | 'complete'
  gate: string | null
}
