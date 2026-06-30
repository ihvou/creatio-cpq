const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function money(n: number): string {
  return usd.format(n)
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}
