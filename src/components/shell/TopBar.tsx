import { Menu, Search, Bell, HelpCircle, Settings, Sparkles } from 'lucide-react'
import { useStore } from '@/lib/store'
import { BuyerIdentify } from './BuyerIdentify'

export function TopBar() {
  const toggleNav = useStore((s) => s.toggleNav)
  return (
    <header className="h-[var(--c-topbar-h)] shrink-0 flex items-center gap-3 px-3 text-white no-print" style={{ background: 'var(--c-chrome)' }}>
      <button onClick={toggleNav} aria-label="Toggle navigation" className="p-1.5 rounded hover:bg-white/10">
        <Menu size={18} />
      </button>
      <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-md px-3 h-8 w-[280px] text-[13px] text-white/70">
        <Search size={15} /> <span>What can I find for you?</span>
      </div>
      <div className="flex-1" />
      <BuyerIdentify />
      <div className="flex items-center gap-1 text-white/80">
        <button className="p-1.5 rounded hover:bg-white/10" aria-label="AI"><Sparkles size={17} /></button>
        <button className="p-1.5 rounded hover:bg-white/10" aria-label="Notifications"><Bell size={17} /></button>
        <button className="p-1.5 rounded hover:bg-white/10" aria-label="Help"><HelpCircle size={17} /></button>
        <button className="p-1.5 rounded hover:bg-white/10" aria-label="Settings"><Settings size={17} /></button>
        <div className="w-7 h-7 rounded-full bg-white/20 ml-1" aria-hidden />
      </div>
    </header>
  )
}
