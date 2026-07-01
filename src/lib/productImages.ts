// Real category photos via loremflickr (free, keyword-matched). One tighter
// keyword per category for better relevance than multi-tag; components fall back
// to the category icon on load error. Deterministic per SKU so it's stable.
const CATEGORY_KW: Record<string, string> = {
  Tile: 'tile',
  Flooring: 'flooring',
  Paint: 'paint',
  Grout: 'grout',
  Adhesive: 'cement',
  Drywall: 'drywall',
  Lumber: 'timber',
  Fasteners: 'screws',
  Tool: 'tools',
  Plumbing: 'pipes',
  Electrical: 'cables',
  Insulation: 'insulation',
  Sealant: 'caulk',
  Hardware: 'hardware',
  Waterproofing: 'waterproofing',
  Accessory: 'tiling',
}

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) % 100000
}

function url(kw: string, lock: number): string {
  return `https://loremflickr.com/400/300/${kw}?lock=${lock}`
}

export function primaryImage(category: string, sku: string): string {
  return url(CATEGORY_KW[category] ?? 'building', hash(sku))
}

export function galleryImages(category: string, sku: string, n = 4): string[] {
  const kw = CATEGORY_KW[category] ?? 'building'
  const base = hash(sku)
  return Array.from({ length: n }, (_, i) => url(kw, base + i * 7919))
}
