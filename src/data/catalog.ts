import type { AlternativeReason, Product, RelatedRef, TogetherReason } from '@/lib/types'
import { round2 } from '@/lib/format'

// ============================================================
// Mock catalogue. The recommendation engine reads relationships from this data
// (SPEC §9, §12). A curated "hero" set (the tile → companions chain + the
// out-of-stock GROUT-5) drives the demo scenarios and the intake sample; a
// deterministic generator pads it out to ~300 items so faceted filters / sort /
// the dense table look production-like. The CATALOG / productBySku /
// searchCatalog API is stable — feature slices depend on it.
// ============================================================

// Category → image keywords (category-mapped stock photos via loremflickr CDN).
const CATEGORY_IMG: Record<string, string> = {
  Tile: 'ceramic,tile',
  Grout: 'grout,tile',
  Adhesive: 'mortar,cement',
  Accessory: 'tile,tools',
  Tool: 'tools,construction',
  Waterproofing: 'waterproofing,membrane',
  Paint: 'paint,wall',
  Drywall: 'drywall,wall',
  Lumber: 'lumber,wood',
  Fasteners: 'screws,hardware',
  Plumbing: 'pipe,plumbing',
  Electrical: 'wire,electrical',
  Insulation: 'insulation,foam',
  Flooring: 'flooring,wood',
  Sealant: 'sealant,caulk',
  Hardware: 'hinge,hardware',
}

function hash01(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) % 100000 / 100000
}

function pick<T>(arr: T[], key: string): T {
  return arr[Math.floor(hash01(key) * arr.length)]
}

// Finding 4: category-icon placeholders (via ProductThumb) replaced the loosely
// matched stock photos. Return '' so components render the category icon.
// Drop a real curated URL here later to show photos.
function imageFor(_category: string, _sku: string): string {
  return ''
}

// ---- Curated hero / intake items (stable SKUs — do not rename) ----
const HEROES: Product[] = [
  {
    sku: 'TILE-CER-300', name: 'Ceramic floor tile 30×30', category: 'Tile', brand: 'Terranova', color: 'Grey', style: 'Matte stone',
    imageUrl: '', specs: { size: '30×30 cm', finish: 'Matte', thickness: '8 mm', rating: 'PEI III' }, unit: 'box', packSize: 1, coverage: '1.44 m² / box',
    rating: 4.4, qualityTier: 1, priceDefault: 24.9, priceBuyer: 22.4, stockQty: 120,
    alternatives: [
      { sku: 'TILE-POR-300', reason: 'better_quality' },
      { sku: 'TILE-CER-300B', reason: 'better_price' },
      { sku: 'TILE-CER-300S', reason: 'same_style' },
    ],
    buyTogether: [
      { sku: 'ADH-20', reason: 'work_together' },
      { sku: 'GROUT-5', reason: 'work_together' },
      { sku: 'SPACER-100', reason: 'work_together' },
      { sku: 'TROWEL-1', reason: 'work_together' },
    ],
  },
  {
    sku: 'TILE-POR-300', name: 'Porcelain floor tile 30×30', category: 'Tile', brand: 'Terranova', color: 'Grey', style: 'Matte stone',
    imageUrl: '', specs: { size: '30×30 cm', finish: 'Matte', thickness: '9 mm', rating: 'PEI IV' }, unit: 'box', packSize: 1, coverage: '1.44 m² / box',
    rating: 4.7, qualityTier: 3, priceDefault: 34.5, priceBuyer: 31.0, stockQty: 60,
    alternatives: [{ sku: 'TILE-CER-300', reason: 'better_price' }],
    buyTogether: [{ sku: 'ADH-20', reason: 'work_together' }, { sku: 'GROUT-5', reason: 'work_together' }],
  },
  {
    sku: 'TILE-CER-300B', name: 'Ceramic floor tile 30×30 — economy', category: 'Tile', brand: 'Basix', color: 'Grey', style: 'Matte stone',
    imageUrl: '', specs: { size: '30×30 cm', finish: 'Matte', thickness: '7 mm', rating: 'PEI II' }, unit: 'box', packSize: 1, coverage: '1.44 m² / box',
    rating: 4.0, qualityTier: 1, priceDefault: 18.9, priceBuyer: 17.0, stockQty: 200,
    alternatives: [{ sku: 'TILE-CER-300', reason: 'better_quality' }],
    buyTogether: [{ sku: 'ADH-20', reason: 'work_together' }],
  },
  {
    sku: 'TILE-CER-300S', name: 'Ceramic floor tile 30×30 — slate look', category: 'Tile', brand: 'Terranova', color: 'Charcoal', style: 'Slate',
    imageUrl: '', specs: { size: '30×30 cm', finish: 'Textured', thickness: '8 mm', rating: 'PEI III' }, unit: 'box', packSize: 1, coverage: '1.44 m² / box',
    rating: 4.5, qualityTier: 2, priceDefault: 27.9, priceBuyer: 25.0, stockQty: 40,
    alternatives: [{ sku: 'TILE-CER-300', reason: 'better_price' }],
    buyTogether: [{ sku: 'GROUT-5', reason: 'same_style' }],
  },
  {
    sku: 'ADH-20', name: 'Tile adhesive 20 kg', category: 'Adhesive', brand: 'BondPro', color: 'Grey', style: '—',
    imageUrl: '', specs: { weight: '20 kg', type: 'Cement-based', coverage: '4–5 m² / bag' }, unit: 'bag', packSize: 1, coverage: '4–5 m² / bag',
    rating: 4.6, qualityTier: 2, priceDefault: 21.0, priceBuyer: 19.0, stockQty: 300,
    alternatives: [], buyTogether: [{ sku: 'TROWEL-1', reason: 'work_together' }],
  },
  {
    sku: 'GROUT-5', name: 'Grout 5 kg — grey', category: 'Grout', brand: 'BondPro', color: 'Grey', style: '—',
    imageUrl: '', specs: { weight: '5 kg', type: 'Cement', jointWidth: '1–6 mm' }, unit: 'bag', packSize: 1,
    rating: 4.3, qualityTier: 1, priceDefault: 12.5, priceBuyer: 11.0, stockQty: 0, // OUT OF STOCK — drives Scenario 3
    alternatives: [{ sku: 'GROUT-5P', reason: 'better_quality' }], buyTogether: [],
  },
  {
    sku: 'GROUT-5P', name: 'Grout 5 kg — premium grey', category: 'Grout', brand: 'BondPro', color: 'Grey', style: '—',
    imageUrl: '', specs: { weight: '5 kg', type: 'Epoxy-blend', jointWidth: '1–8 mm', stainResist: 'Yes' }, unit: 'bag', packSize: 1,
    rating: 4.8, qualityTier: 2, priceDefault: 16.0, priceBuyer: 14.5, stockQty: 80,
    alternatives: [{ sku: 'GROUT-5', reason: 'better_price' }], buyTogether: [],
  },
  {
    sku: 'SPACER-100', name: 'Tile spacers 2 mm (100)', category: 'Accessory', brand: 'Basix', color: 'White', style: '—',
    imageUrl: '', specs: { size: '2 mm', qty: '100 pcs' }, unit: 'pack', packSize: 100,
    rating: 4.2, qualityTier: 1, priceDefault: 4.5, priceBuyer: 4.0, stockQty: 500,
    alternatives: [{ sku: 'SPACER-200', reason: 'same_style' }], buyTogether: [],
  },
  {
    sku: 'SPACER-200', name: 'Tile spacers 3 mm (100)', category: 'Accessory', brand: 'Basix', color: 'White', style: '—',
    imageUrl: '', specs: { size: '3 mm', qty: '100 pcs' }, unit: 'pack', packSize: 100,
    rating: 4.2, qualityTier: 1, priceDefault: 4.5, priceBuyer: 4.0, stockQty: 400,
    alternatives: [{ sku: 'SPACER-100', reason: 'same_style' }], buyTogether: [],
  },
  {
    sku: 'TROWEL-1', name: 'Notched trowel 6 mm', category: 'Tool', brand: 'GripWell', color: 'Steel', style: '—',
    imageUrl: '', specs: { notch: '6 mm', handle: 'Rubber' }, unit: 'each', packSize: 1,
    rating: 4.5, qualityTier: 1, priceDefault: 9.9, priceBuyer: 8.9, stockQty: 150,
    alternatives: [], buyTogether: [],
  },
  {
    sku: 'MEMB-1', name: 'Waterproof membrane roll 5 m²', category: 'Waterproofing', brand: 'AquaStop', color: 'Blue', style: '—',
    imageUrl: '', specs: { coverage: '5 m²', type: 'Liquid-applied sheet' }, unit: 'roll', packSize: 1, coverage: '5 m² / roll',
    rating: 4.6, qualityTier: 2, priceDefault: 45.0, priceBuyer: 41.0, stockQty: 25,
    alternatives: [], buyTogether: [],
  },
]

// ---- Generated catalogue ----
const BRANDS = ['Terranova', 'BondPro', 'Basix', 'GripWell', 'AquaStop', 'ProBuild', 'Sierra', 'NorthPeak', 'Veritas', 'Ironclad', 'Lumina', 'EverSeal']
const COLORS = ['White', 'Grey', 'Charcoal', 'Beige', 'Black', 'Blue', 'Green', 'Natural', 'Walnut', 'Sand', 'Slate', 'Red']
const ADJ = ['Premium', 'Standard', 'Pro', 'Heavy-duty', 'Eco', 'Contractor', 'Value', 'Classic', 'Industrial', 'Builder']

interface CatTemplate {
  category: string
  prefix: string
  base: string
  styles: string[]
  unit: string
  packSize: number
  price: [number, number]
  coverage?: string
  count: number
}

const TEMPLATES: CatTemplate[] = [
  { category: 'Tile', prefix: 'TIL', base: 'ceramic tile', styles: ['Matte stone', 'Slate', 'Marble', 'Wood-look', 'Concrete'], unit: 'box', packSize: 1, price: [14, 48], coverage: '1.44 m² / box', count: 26 },
  { category: 'Paint', prefix: 'PNT', base: 'interior paint', styles: ['Matte', 'Eggshell', 'Satin', 'Semi-gloss'], unit: 'gal', packSize: 1, price: [18, 62], coverage: '34 m² / gal', count: 26 },
  { category: 'Grout', prefix: 'GRT', base: 'grout', styles: ['Sanded', 'Unsanded', 'Epoxy'], unit: 'bag', packSize: 1, price: [9, 28], count: 14 },
  { category: 'Adhesive', prefix: 'ADX', base: 'adhesive', styles: ['Cement-based', 'Premixed', 'Rapid-set'], unit: 'bag', packSize: 1, price: [12, 36], coverage: '4–5 m² / bag', count: 14 },
  { category: 'Drywall', prefix: 'DRY', base: 'drywall sheet', styles: ['Standard', 'Moisture-resistant', 'Fire-rated'], unit: 'sheet', packSize: 1, price: [10, 26], coverage: '2.97 m² / sheet', count: 20 },
  { category: 'Lumber', prefix: 'LMB', base: 'framing lumber', styles: ['Pine', 'Spruce', 'Treated'], unit: 'each', packSize: 1, price: [4, 22], count: 24 },
  { category: 'Fasteners', prefix: 'FST', base: 'screws', styles: ['Coarse', 'Fine', 'Self-tapping'], unit: 'box', packSize: 200, price: [5, 24], count: 22 },
  { category: 'Tool', prefix: 'TLX', base: 'hand tool', styles: ['—'], unit: 'each', packSize: 1, price: [7, 89], count: 24 },
  { category: 'Plumbing', prefix: 'PLM', base: 'PVC fitting', styles: ['—'], unit: 'each', packSize: 1, price: [2, 45], count: 22 },
  { category: 'Electrical', prefix: 'ELC', base: 'wiring', styles: ['—'], unit: 'roll', packSize: 1, price: [12, 95], coverage: '50 m / roll', count: 20 },
  { category: 'Insulation', prefix: 'INS', base: 'insulation batt', styles: ['Fiberglass', 'Mineral wool'], unit: 'pack', packSize: 1, price: [22, 58], coverage: '8 m² / pack', count: 16 },
  { category: 'Flooring', prefix: 'FLR', base: 'laminate plank', styles: ['Oak', 'Walnut', 'Grey wash'], unit: 'box', packSize: 1, price: [19, 54], coverage: '2.2 m² / box', count: 22 },
  { category: 'Sealant', prefix: 'SEL', base: 'silicone sealant', styles: ['Clear', 'White', 'Grey'], unit: 'each', packSize: 1, price: [4, 16], count: 14 },
  { category: 'Hardware', prefix: 'HDW', base: 'cabinet hardware', styles: ['Brushed', 'Matte black', 'Chrome'], unit: 'pack', packSize: 1, price: [3, 32], count: 16 },
]

const COMPANIONS: Record<string, string[]> = {
  Tile: ['Adhesive', 'Grout', 'Tool', 'Sealant'],
  Paint: ['Tool', 'Sealant', 'Hardware'],
  Grout: ['Tile', 'Tool'],
  Adhesive: ['Tile', 'Tool'],
  Drywall: ['Fasteners', 'Tool', 'Insulation'],
  Lumber: ['Fasteners', 'Tool'],
  Fasteners: ['Tool', 'Lumber'],
  Tool: ['Fasteners'],
  Plumbing: ['Tool', 'Sealant'],
  Electrical: ['Tool', 'Hardware'],
  Insulation: ['Drywall', 'Tool'],
  Flooring: ['Adhesive', 'Tool', 'Sealant'],
  Sealant: ['Tool'],
  Hardware: ['Tool', 'Fasteners'],
}

function generate(): Product[] {
  const byCat: Record<string, string[]> = {}
  const items: Product[] = []

  for (const t of TEMPLATES) {
    byCat[t.category] = []
    for (let i = 0; i < t.count; i++) {
      const sku = `${t.prefix}-${String(i + 1).padStart(3, '0')}`
      byCat[t.category].push(sku)
      const color = pick(COLORS, sku + 'c')
      const adj = pick(ADJ, sku + 'a')
      const style = pick(t.styles, sku + 's')
      const price = round2(t.price[0] + hash01(sku + 'p') * (t.price[1] - t.price[0]))
      const tier = ((i % 3) + 1) as 1 | 2 | 3
      const stock = i % 13 === 0 ? 0 : Math.floor(hash01(sku + 'q') * 200) + 6
      items.push({
        sku,
        name: `${adj} ${t.base} — ${color}`,
        category: t.category,
        brand: pick(BRANDS, sku + 'b'),
        color,
        style,
        imageUrl: imageFor(t.category, sku),
        specs: { tier: tier === 3 ? 'Best' : tier === 2 ? 'Better' : 'Good', pack: `${t.packSize} / ${t.unit}` },
        unit: t.unit,
        packSize: t.packSize,
        coverage: t.coverage,
        rating: round2(3.6 + hash01(sku + 'r') * 1.3),
        qualityTier: tier,
        priceDefault: price,
        priceBuyer: round2(price * 0.9),
        stockQty: stock,
        alternatives: [],
        buyTogether: [],
      })
    }
  }

  // Relationships: alternatives within category, buy-together across companions.
  const indexBySku = new Map(items.map((p, idx) => [p.sku, idx]))
  for (const p of items) {
    const peers = byCat[p.category]
    const self = peers.indexOf(p.sku)
    const alt: RelatedRef<AlternativeReason>[] = []
    const reasons: AlternativeReason[] = ['better_price', 'better_quality', 'same_style']
    for (let k = 1; k <= 3 && k < peers.length; k++) {
      alt.push({ sku: peers[(self + k) % peers.length], reason: reasons[k - 1] })
    }
    p.alternatives = alt

    const together: RelatedRef<TogetherReason>[] = []
    for (const cat of COMPANIONS[p.category] ?? []) {
      const list = byCat[cat]
      if (!list || !list.length) continue
      together.push({ sku: list[0], reason: 'work_together' })
      if (list.length > 4) together.push({ sku: list[Math.floor(list.length / 2)], reason: 'same_style' })
      if (together.length >= 4) break
    }
    p.buyTogether = together
  }

  // Sanity: drop any dangling refs (defensive).
  for (const p of items) {
    p.alternatives = p.alternatives.filter((r) => indexBySku.has(r.sku) || HEROES.some((h) => h.sku === r.sku))
    p.buyTogether = p.buyTogether.filter((r) => indexBySku.has(r.sku) || HEROES.some((h) => h.sku === r.sku))
  }

  return items
}

export const CATALOG: Product[] = [
  ...HEROES.map((h) => ({ ...h, imageUrl: imageFor(h.category, h.sku) })),
  ...generate(),
]

const BY_SKU = new Map(CATALOG.map((p) => [p.sku, p]))

export function productBySku(sku: string): Product | undefined {
  return BY_SKU.get(sku)
}

const ORDER_INDEX = new Map(CATALOG.map((p, i) => [p.sku, i]))

// Stable catalogue position — used for best-match tie-breaking without the
// O(n) CATALOG.indexOf() inside a sort comparator.
export function catalogIndex(sku: string): number {
  return ORDER_INDEX.get(sku) ?? Number.MAX_SAFE_INTEGER
}

export function searchCatalog(q: string): Product[] {
  const term = q.trim().toLowerCase()
  if (!term) return CATALOG
  return CATALOG.filter((p) =>
    [p.sku, p.name, p.brand, p.category, p.color, p.style].join(' ').toLowerCase().includes(term),
  )
}
