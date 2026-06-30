import { cn } from '@/lib/util'

const ITEMS: { label: string; color: string; active?: boolean }[] = [
  { label: 'Accounts', color: 'var(--c-app-accounts)' },
  { label: 'Contacts', color: 'var(--c-app-contacts)' },
  { label: 'Opportunities', color: 'var(--c-app-opportun)' },
  { label: 'CPQ', color: 'var(--c-app-cpq)', active: true },
  { label: 'Orders', color: 'var(--c-app-orders)' },
  { label: 'Products', color: 'var(--c-app-products)' },
  { label: 'Invoices', color: 'var(--c-app-invoices)' },
]

// Mock nav items (non-functional) make the shell believable and tie to the CPQ
// data model. Only "CPQ" is active — it hosts the consultant workspace.
export function NavRail({ collapsed }: { collapsed: boolean }) {
  return (
    <aside
      className="h-full shrink-0 text-white flex flex-col"
      style={{ width: collapsed ? 'var(--c-nav-w-collapsed)' : 'var(--c-nav-w)', background: 'var(--c-chrome)' }}
    >
      <div className="h-[var(--c-topbar-h)] flex items-center px-4 font-semibold text-[15px]">
        {collapsed ? 'C' : 'Creatio'}
      </div>
      <nav className="px-2 py-2 flex flex-col gap-0.5">
        {ITEMS.map((it) => (
          <div
            key={it.label}
            className={cn('flex items-center gap-3 h-10 rounded-sm px-2 cursor-default', !it.active && 'hover:bg-white/5')}
            style={it.active ? { background: 'var(--c-chrome-active)', boxShadow: 'inset 3px 0 0 var(--c-accent)' } : undefined}
          >
            <span className="w-[18px] h-[18px] rounded-[5px] shrink-0" style={{ background: it.color }} />
            {!collapsed && (
              <span className={cn('text-[13px]', it.active ? 'text-white' : 'text-[var(--c-on-chrome-muted)]')}>{it.label}</span>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
