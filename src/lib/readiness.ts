import type { QuoteLine, ReadinessFlag, ReadinessIssue } from './types'
import { productBySku } from '@/data/catalog'

// Order-readiness check, run at "Create order" (SPEC §7 / §9). Non-blocking:
// returns one flag per problem line. The UI renders a tiny inline marker.
export function readinessFor(lines: QuoteLine[]): ReadinessFlag[] {
  const flags: ReadinessFlag[] = []
  for (const line of lines) {
    const issues: ReadinessIssue[] = []
    const p = productBySku(line.sku)
    if (!p || p.stockQty <= 0 || p.stockQty < line.qty) issues.push('unavailable')
    if (line.originalSku) {
      const original = productBySku(line.originalSku)
      if (original && p && p.qualityTier !== original.qualityTier) issues.push('quality_mismatch')
    }
    if (issues.length) flags.push({ lineId: line.id, issues })
  }
  return flags
}

export function readinessForLine(line: QuoteLine): ReadinessFlag | undefined {
  return readinessFor([line])[0]
}
