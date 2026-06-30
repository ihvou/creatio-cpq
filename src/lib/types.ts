// ============================================================
// FROZEN CONTRACTS — the shared data model every feature slice
// consumes. Changing anything here is a foundation-owner action;
// slices must not edit this file. (SPEC §8)
// ============================================================

export type PriceListId = 'default' | 'buyer'

export interface PriceList {
  id: PriceListId
  name: string
}

export type AvailabilityState = 'available' | 'low' | 'out'

export type AlternativeReason = 'better_price' | 'better_quality' | 'same_style'
export type TogetherReason = 'same_style' | 'work_together'

export interface RelatedRef<R extends string> {
  sku: string
  reason: R
}

export interface Product {
  sku: string
  name: string
  category: string
  brand: string
  color: string
  style: string
  imageUrl: string
  specs: Record<string, string>
  unit: string // 'box' | 'bag' | 'pack' | 'each' | 'roll'
  packSize: number
  coverage?: string // e.g. '1.44 m² / box'
  rating: number // 0..5
  qualityTier: 1 | 2 | 3 // 1 good · 2 better · 3 best — drives quality-mismatch checks
  priceDefault: number
  priceBuyer: number
  stockQty: number
  alternatives: RelatedRef<AlternativeReason>[]
  buyTogether: RelatedRef<TogetherReason>[]
}

export interface Account {
  id: string
  name: string
  type: string
  phone: string
  email: string
  externalId: string // Pro ID
  priceListId: PriceListId
  eligibilityBadge?: string // e.g. 'Pro pricing eligible'
  vip?: boolean
}

export interface Contact {
  id: string
  accountId: string
  name: string
  phone: string
  email: string
}

export type QuoteStatus = 'draft' | 'shared' | 'ordered'

export type LineAvailability = 'available' | 'unavailable' | 'swapped'

export interface QuoteLine {
  id: string
  sku: string
  name: string
  qty: number
  unitPrice: number
  extPrice: number
  availabilityState: LineAvailability
  originalSku?: string // set when swapped — enables quality-mismatch detection
  note?: string
}

export interface Quote {
  id: string
  number: string // Q-2026-0001
  accountId: string | null
  contactId: string | null
  status: QuoteStatus
  validUntil: string // ISO date (yyyy-mm-dd)
  notes: string
  lines: QuoteLine[]
  createdAt: string // ISO datetime
}

// ---- Emulated intake (SPEC §10) ----
export type MatchConfidence = 'high' | 'low'

export interface ParsedLine {
  rawLine: string
  sku: string | null // null = unmatched → manual search
  name: string
  qty: number
  confidence: MatchConfidence
  candidateSkus?: string[] // for 'low' → pick from candidates
}

// ---- Order-readiness (SPEC §7 / §9) ----
export type ReadinessIssue = 'unavailable' | 'quality_mismatch'

export interface ReadinessFlag {
  lineId: string
  issues: ReadinessIssue[]
}
