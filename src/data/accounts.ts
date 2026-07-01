import type { Account, Contact } from '@/lib/types'

export const ACCOUNTS: Account[] = [
  {
    id: 'ACC-ACME',
    name: 'Acme Renovations',
    type: 'company',
    phone: '+1 415 555 0142',
    email: 'orders@acmereno.com',
    externalId: 'PRO-558123',
    priceListId: 'buyer',
    eligibilityBadge: 'Pro pricing eligible',
    vip: true,
  },
  {
    id: 'ACC-BRIGHT',
    name: 'Brightline Builders',
    type: 'company',
    phone: '+1 312 555 0199',
    email: 'desk@brightline.co',
    externalId: 'PRO-771045',
    priceListId: 'buyer',
    eligibilityBadge: 'Pro pricing eligible',
    vip: false,
  },
]

export const CONTACTS: Contact[] = [
  { id: 'CT-ACME-1', accountId: 'ACC-ACME', name: 'Marco Diaz', phone: '+1 415 555 0142', email: 'marco@acmereno.com', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 'CT-BRIGHT-1', accountId: 'ACC-BRIGHT', name: 'Tanya Brooks', phone: '+1 312 555 0199', email: 'tanya@brightline.co', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
]

export function contactsForAccount(accountId: string): Contact[] {
  return CONTACTS.filter((c) => c.accountId === accountId)
}

export function searchAccounts(q: string): Account[] {
  const term = q.trim().toLowerCase()
  if (!term) return ACCOUNTS
  return ACCOUNTS.filter((a) =>
    [a.name, a.phone, a.email, a.externalId].join(' ').toLowerCase().includes(term),
  )
}
