import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/shell/AppShell'
import { Workspace } from '@/features/workspace/Workspace'
import { IntakePaste } from '@/pages/IntakePaste'
import { BuyerQuote } from '@/pages/BuyerQuote'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell><Workspace /></AppShell>} />
      <Route path="/t/:sessionId" element={<IntakePaste />} />
      <Route path="/q/:quoteId" element={<BuyerQuote />} />
    </Routes>
  )
}
