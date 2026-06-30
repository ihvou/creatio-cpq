import type { ParsedLine } from './types'
import { SAMPLE_PARSED } from '@/data/sampleIntake'

// EMULATED intake (SPEC §10). The demo maps a fixed sample paste to a hardcoded
// interpreted result — no LLM, no network. A real Claude call swaps in BEHIND
// this exact signature later, with zero UI changes.
export function parseList(_text: string): ParsedLine[] {
  return SAMPLE_PARSED
}
