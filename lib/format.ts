// Formatage fr-FR et calculs de dates sur des chaînes ISO (YYYY-MM-DD / YYYY-MM),
// en UTC pour éviter les décalages d'heure d'été et de fuseau.

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
export const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

export function fmtEur(n: number, decimals = 2): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}

export function fmtNum(n: number, decimals = 2, minDecimals = decimals): string {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: minDecimals, maximumFractionDigits: decimals }).format(n)
}

export function fmtPct(n: number, decimals = 2, signed = false): string {
  const s = `${fmtNum(n, decimals)} %`
  return signed && n > 0 ? `+${s}` : s
}

/** 2026-10-20 → 20/10/2026 */
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

/** 2026-10-20 → 20 octobre 2026 */
export function fmtDateLong(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return `${d === 1 ? '1er' : d} ${MOIS[m - 1]} ${y}`
}

/** 2026-08 → août 2026 */
export function fmtMonth(period: string): string {
  const [y, m] = period.split('-').map(Number)
  return `${MOIS[m - 1]} ${y}`
}

function toUtc(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

function fromUtc(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

export function addDays(iso: string, days: number): string {
  return fromUtc(toUtc(iso) + days * 86400000)
}

/** Nombre de jours de `from` à `to` (positif si `to` est après `from`). */
export function diffDays(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / 86400000)
}

export function addMonths(period: string, months: number): string {
  const [y, m] = period.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + months, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function diffMonths(from: string, to: string): number {
  const [y1, m1] = from.split('-').map(Number)
  const [y2, m2] = to.split('-').map(Number)
  return (y2 - y1) * 12 + (m2 - m1)
}

export function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s)
}

export function isPeriod(s: string): boolean {
  return /^\d{4}-\d{2}$/.test(s)
}

/** Date du jour à Paris (YYYY-MM-DD). */
export function todayParis(): string {
  return new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date())
}

/** Saisie utilisateur « 12 345,67 » → 12345.67 */
export function parseNumber(s: string): number {
  const n = parseFloat(s.replace(/\s/g, '').replace(',', '.'))
  return isNaN(n) ? NaN : n
}
