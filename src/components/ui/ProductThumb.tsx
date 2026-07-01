import { useState } from 'react'
import { Grid3x3, PaintBucket, Droplets, Package, Boxes, Frame, Ruler, Wrench, Hammer, Zap, Layers, type LucideIcon } from 'lucide-react'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/util'

// Category → icon fallback. Renders the product's real photo when available and
// loading succeeds; falls back to the category icon on error (finding 4).
const ICON: Record<string, LucideIcon> = {
  Tile: Grid3x3,
  Flooring: Grid3x3,
  Paint: PaintBucket,
  Sealant: Droplets,
  Waterproofing: Droplets,
  Plumbing: Droplets,
  Adhesive: Package,
  Accessory: Package,
  Grout: Boxes,
  Drywall: Frame,
  Lumber: Ruler,
  Fasteners: Wrench,
  Hardware: Wrench,
  Tool: Hammer,
  Electrical: Zap,
  Insulation: Layers,
}

export function ProductThumb({ product, size = 24, className }: { product: Product; size?: number; className?: string }) {
  const [broken, setBroken] = useState(false)
  const Icon = ICON[product.category] ?? Package
  const showImg = product.imageUrl && !broken
  return (
    <div className={cn('bg-surface-2 border border-line flex items-center justify-center text-ink-muted overflow-hidden', className)}>
      {showImg ? (
        <img src={product.imageUrl} alt={product.name} loading="lazy" onError={() => setBroken(true)} className="w-full h-full object-cover" />
      ) : (
        <Icon size={size} />
      )}
    </div>
  )
}
