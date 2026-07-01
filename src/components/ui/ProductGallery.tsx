import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product } from '@/lib/types'
import { galleryImages } from '@/lib/productImages'
import { ProductThumb } from './ProductThumb'
import { cn } from '@/lib/util'

// Multi-image gallery: big main image + thumbnail strip + prev/next. Falls back
// to the category icon per-image on load error.
export function ProductGallery({ product }: { product: Product }) {
  const imgs = galleryImages(product.category, product.sku, 4)
  const [i, setI] = useState(0)
  const [broken, setBroken] = useState<Record<number, boolean>>({})

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="relative aspect-[4/3] rounded-md bg-surface-2 border border-line overflow-hidden flex items-center justify-center">
        {broken[i] ? (
          <ProductThumb product={product} size={48} className="w-full h-full border-0" />
        ) : (
          <img src={imgs[i]} alt={product.name} className="w-full h-full object-cover" onError={() => setBroken((b) => ({ ...b, [i]: true }))} />
        )}
        {imgs.length > 1 && (
          <>
            <button onClick={() => setI((i - 1 + imgs.length) % imgs.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-surface/85 hover:bg-surface rounded-full p-1 border border-line" aria-label="Previous image">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setI((i + 1) % imgs.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface/85 hover:bg-surface rounded-full p-1 border border-line" aria-label="Next image">
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
      <div className="flex gap-2">
        {imgs.map((src, idx) => (
          <button key={idx} onClick={() => setI(idx)} className={cn('w-14 h-14 rounded-sm overflow-hidden border shrink-0', idx === i ? 'border-primary' : 'border-line')} aria-label={`Image ${idx + 1}`}>
            {broken[idx] ? (
              <ProductThumb product={product} size={16} className="w-full h-full border-0" />
            ) : (
              <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" onError={() => setBroken((b) => ({ ...b, [idx]: true }))} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
