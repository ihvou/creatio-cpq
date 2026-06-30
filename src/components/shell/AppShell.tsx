import type { ReactNode } from 'react'
import { useStore } from '@/lib/store'
import { NavRail } from './NavRail'
import { TopBar } from './TopBar'

export function AppShell({ children }: { children: ReactNode }) {
  const navCollapsed = useStore((s) => s.navCollapsed)
  return (
    <div className="h-screen w-screen overflow-hidden flex">
      <NavRail collapsed={navCollapsed} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 min-h-0 overflow-hidden bg-bg">{children}</main>
      </div>
    </div>
  )
}
