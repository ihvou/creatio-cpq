import type { Product, QuoteLine } from './types'
import { productBySku } from '@/data/catalog'

// Deterministic configuration check run before quote generation (Codex #3 /
// the deferred "Missing essentials"). Missing = a work-together companion whose
// CATEGORY is absent from the quote. Blocks = hard incompatibilities present.
const INCOMPATIBLE_PAIRS: { a: string; b: string; reason: string }[] = [
  { a: 'SPACER-100', b: 'SPACER-200', reason: '2 mm and 3 mm tile spacers set different joint widths — use one size per layout.' },
]

export interface ConfigResult {
  missing: Product[]
  blocks: { a: Product; b: Product; reason: string }[]
}

export function configCheck(lines: QuoteLine[]): ConfigResult {
  const skus = new Set(lines.map((l) => l.sku))
  const cats = new Set(lines.map((l) => productBySku(l.sku)?.category).filter(Boolean) as string[])

  const missingByCat = new Map<string, Product>()
  for (const l of lines) {
    const p = productBySku(l.sku)
    if (!p) continue
    for (const ref of p.buyTogether) {
      if (ref.reason !== 'work_together') continue
      const companion = productBySku(ref.sku)
      if (!companion) continue
      if (!cats.has(companion.category) && !missingByCat.has(companion.category)) {
        missingByCat.set(companion.category, companion)
      }
    }
  }

  const blocks: ConfigResult['blocks'] = []
  for (const pair of INCOMPATIBLE_PAIRS) {
    if (skus.has(pair.a) && skus.has(pair.b)) {
      const a = productBySku(pair.a)
      const b = productBySku(pair.b)
      if (a && b) blocks.push({ a, b, reason: pair.reason })
    }
  }

  return { missing: [...missingByCat.values()], blocks }
}
