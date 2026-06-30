import type { Product, AvailabilityState } from './types'

export const LOW_STOCK = 10

export function availabilityOf(p: Product): AvailabilityState {
  if (p.stockQty <= 0) return 'out'
  if (p.stockQty <= LOW_STOCK) return 'low'
  return 'available'
}
