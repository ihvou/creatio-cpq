import { create } from 'zustand'
import type { Account, Contact, ParsedLine, PriceListId, Quote, QuoteLine } from './types'
import { productBySku } from '@/data/catalog'
import { ACCOUNTS, contactsForAccount } from '@/data/accounts'
import { priceFor, lineExt } from './pricing'
import { round2 } from './format'
import { genId } from './util'

// ============================================================
// CENTRAL QUOTE STORE — the single source of truth + action API.
// This is the contract feature slices call. Slices MUST NOT mutate
// state directly or add actions here without the foundation owner.
// ============================================================

export type WorkspaceView = 'catalog' | 'quote' | 'order'
export type CatalogView = 'tiles' | 'table'

function quoteNumber(): string {
  return `Q-2026-${Math.floor(1000 + Math.random() * 9000)}`
}

function plus30Days(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}

function newQuote(): Quote {
  return {
    id: genId('quote'),
    number: quoteNumber(),
    accountId: null,
    contactId: null,
    opportunityId: null,
    status: 'draft',
    validUntil: plus30Days(),
    notes: '',
    lines: [],
    createdAt: new Date().toISOString(),
  }
}

function repriceLines(lines: QuoteLine[], priceListId: PriceListId): QuoteLine[] {
  return lines.map((l) => {
    const p = productBySku(l.sku)
    const unitPrice = p ? priceFor(p, priceListId) : l.unitPrice
    return { ...l, unitPrice, extPrice: lineExt(unitPrice, l.qty) }
  })
}

interface StoreState {
  quote: Quote
  buyer: Account | null
  contact: Contact | null
  verified: boolean
  view: WorkspaceView
  catalogView: CatalogView
  navCollapsed: boolean

  priceListId: () => PriceListId

  // buyer (available anytime — re-prices the whole quote; SPEC §6.1, §9)
  setBuyer: (accountId: string | null) => void
  registerBuyer: (input: { name: string; phone?: string; email?: string }) => void
  verifyBuyer: () => void

  // line operations
  addLine: (sku: string, qty?: number) => void
  removeLine: (lineId: string) => void
  setQty: (lineId: string, qty: number) => void
  swapLine: (lineId: string, newSku: string) => void // keeps originalSku; re-prices
  setNote: (note: string) => void
  applyParsed: (lines: ParsedLine[]) => void

  // navigation / view
  setView: (v: WorkspaceView) => void
  setCatalogView: (v: CatalogView) => void
  toggleNav: () => void

  // lifecycle
  generateQuote: () => void
  shareQuote: () => void
  createOrder: () => void
  resetDraft: () => void
}

export const useStore = create<StoreState>((set, get) => ({
  quote: newQuote(),
  buyer: null,
  contact: null,
  verified: false,
  view: 'catalog',
  catalogView: 'tiles',
  navCollapsed: false,

  priceListId: () => get().buyer?.priceListId ?? 'default',

  setBuyer: (accountId) => {
    const buyer = accountId ? ACCOUNTS.find((a) => a.id === accountId) ?? null : null
    const contact = buyer ? contactsForAccount(buyer.id)[0] ?? null : null
    const priceListId: PriceListId = buyer?.priceListId ?? 'default'
    const opportunityId = buyer ? `OPP-2026-${buyer.externalId.match(/\d{4}$/)?.[0] ?? '0142'}` : null
    set((s) => ({
      buyer,
      contact,
      verified: false,
      quote: {
        ...s.quote,
        accountId: buyer?.id ?? null,
        contactId: contact?.id ?? null,
        opportunityId,
        lines: repriceLines(s.quote.lines, priceListId),
      },
    }))
  },

  registerBuyer: (input) => {
    const buyer: Account = {
      id: genId('acc'),
      name: input.name,
      type: 'company',
      phone: input.phone ?? '',
      email: input.email ?? '',
      externalId: '',
      priceListId: 'default',
      vip: false,
    }
    set((s) => ({ buyer, contact: null, verified: false, quote: { ...s.quote, accountId: buyer.id, contactId: null, opportunityId: 'OPP-2026-NEW' } }))
  },

  verifyBuyer: () => set({ verified: true }),

  addLine: (sku, qty = 1) => {
    const product = productBySku(sku)
    if (!product) return
    const priceListId = get().priceListId()
    set((s) => {
      const existing = s.quote.lines.find((l) => l.sku === sku && !l.originalSku)
      let lines: QuoteLine[]
      if (existing) {
        const nextQty = existing.qty + qty
        lines = s.quote.lines.map((l) =>
          l.id === existing.id ? { ...l, qty: nextQty, extPrice: lineExt(l.unitPrice, nextQty) } : l,
        )
      } else {
        const unitPrice = priceFor(product, priceListId)
        const line: QuoteLine = {
          id: genId('line'),
          sku: product.sku,
          name: product.name,
          qty,
          unitPrice,
          extPrice: lineExt(unitPrice, qty),
          availabilityState: product.stockQty > 0 ? 'available' : 'unavailable',
        }
        lines = [...s.quote.lines, line]
      }
      return { quote: { ...s.quote, lines } }
    })
  },

  removeLine: (lineId) =>
    set((s) => ({ quote: { ...s.quote, lines: s.quote.lines.filter((l) => l.id !== lineId) } })),

  setQty: (lineId, qty) => {
    const next = Math.max(1, Math.round(qty))
    set((s) => ({
      quote: {
        ...s.quote,
        lines: s.quote.lines.map((l) =>
          l.id === lineId ? { ...l, qty: next, extPrice: lineExt(l.unitPrice, next) } : l,
        ),
      },
    }))
  },

  swapLine: (lineId, newSku) => {
    const product = productBySku(newSku)
    if (!product) return
    const priceListId = get().priceListId()
    set((s) => ({
      quote: {
        ...s.quote,
        lines: s.quote.lines.map((l) => {
          if (l.id !== lineId) return l
          const unitPrice = priceFor(product, priceListId)
          return {
            ...l,
            originalSku: l.originalSku ?? l.sku,
            sku: product.sku,
            name: product.name,
            unitPrice,
            extPrice: lineExt(unitPrice, l.qty),
            availabilityState: 'swapped',
          }
        }),
      },
    }))
  },

  setNote: (note) => set((s) => ({ quote: { ...s.quote, notes: note } })),

  applyParsed: (parsed) => {
    // Foundation convenience: pull in confident matches. The reconciliation UI
    // (Codex slice: features/intake) handles low-confidence / unmatched lines.
    parsed
      .filter((p): p is ParsedLine & { sku: string } => Boolean(p.sku) && p.confidence === 'high')
      .forEach((p) => get().addLine(p.sku, p.qty))
  },

  setView: (view) => set({ view }),
  setCatalogView: (catalogView) => set({ catalogView }),
  toggleNav: () => set((s) => ({ navCollapsed: !s.navCollapsed })),

  generateQuote: () => set((s) => ({ view: 'quote', quote: { ...s.quote, validUntil: plus30Days() } })),
  shareQuote: () => set((s) => ({ quote: { ...s.quote, status: 'shared' } })),
  createOrder: () => set((s) => ({ view: 'order', quote: { ...s.quote, status: 'ordered' } })),

  // Clear the draft and start fresh (keeps the identified buyer). Review finding 1.
  resetDraft: () =>
    set((s) => ({
      quote: { ...newQuote(), accountId: s.buyer?.id ?? null, contactId: s.contact?.id ?? null, opportunityId: s.quote.opportunityId },
      view: 'catalog',
    })),
}))

export function selectSubtotal(lines: QuoteLine[]): number {
  return Math.round(lines.reduce((sum, l) => sum + l.extPrice, 0) * 100) / 100
}

// Savings vs the standard price list when a buyer-priced account is active (finding 5).
export function selectSavings(lines: QuoteLine[], priceListId: PriceListId): number {
  if (priceListId !== 'buyer') return 0
  return round2(
    lines.reduce((sum, l) => {
      const p = productBySku(l.sku)
      return p ? sum + (p.priceDefault - p.priceBuyer) * l.qty : sum
    }, 0),
  )
}
