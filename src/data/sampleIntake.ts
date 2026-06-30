import type { ParsedLine } from '@/lib/types'

// The fixed "messy paste" + its hardcoded interpreted result (SPEC §10, §12).
// Exercises every reconciliation branch: confident matches, one low-confidence
// (pick-from-candidates), and one unmatched (→ manual search).
export const SAMPLE_PASTE = `12 boxes ceramic floor tile 30x30
grout grey ~5kg
tile spacers
2 trowels
waterproof membrane roll`

export const SAMPLE_PARSED: ParsedLine[] = [
  { rawLine: '12 boxes ceramic floor tile 30x30', sku: 'TILE-CER-300', name: 'Ceramic floor tile 30×30', qty: 12, confidence: 'high' },
  { rawLine: 'grout grey ~5kg', sku: 'GROUT-5', name: 'Grout 5 kg — grey', qty: 1, confidence: 'high' },
  { rawLine: 'tile spacers', sku: 'SPACER-100', name: 'Tile spacers 2 mm (100)', qty: 1, confidence: 'low', candidateSkus: ['SPACER-100', 'SPACER-200'] },
  { rawLine: '2 trowels', sku: 'TROWEL-1', name: 'Notched trowel 6 mm', qty: 2, confidence: 'high' },
  { rawLine: 'waterproof membrane roll', sku: null, name: 'waterproof membrane', qty: 1, confidence: 'low' },
]
