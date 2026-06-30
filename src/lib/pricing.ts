import type { Product, PriceListId } from './types'
import { round2 } from './format'

export function priceFor(product: Product, priceListId: PriceListId): number {
  return priceListId === 'buyer' ? product.priceBuyer : product.priceDefault
}

export function lineExt(unitPrice: number, qty: number): number {
  return round2(unitPrice * qty)
}
