import { Grid3x3, PaintBucket, Droplets, Package, Boxes, Frame, Ruler, Wrench, Hammer, Zap, Layers, type LucideIcon } from 'lucide-react'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/util'

// Category → icon. Clean, always-relevant, network-free placeholders (finding 4).
// If a product later gets a real curated imageUrl, it renders that instead.
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
  const Icon = ICON[product.category] ?? Package
  return (
    <div className={cn('bg-surface-2 border border-line flex items-center justify-center text-ink-muted overflow-hidden', className)}>
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
      ) : (
        <Icon size={size} />
      )}
    </div>
  )
}
