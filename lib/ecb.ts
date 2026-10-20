// Taux des opérations principales de refinancement de la BCE (MRO) et taux des
// intérêts moratoires qui en découlent (taux BCE au 1er jour du semestre + 8 points,
// art. R2192-31 du Code de la commande publique).

const ECB_MRO_CSV =
  'https://data-api.ecb.europa.eu/service/data/FM/B.U2.EUR.4F.KR.MRR_FR.LEV?format=csvdata&startPeriod=2008-01-01'

export const MAJORATION_POINTS = 8

export type RateChange = { date: string; rate: number }

export type SemesterRate = {
  /** 1er jour du semestre (YYYY-01-01 ou YYYY-07-01) */
  start: string
  label: string
  ecb: number
  taux: number
}

// Repli si l'API BCE est indisponible. Dernière synchronisation : 20/10/2026.
const FALLBACK: RateChange[] = [
  { date: '2008-10-15', rate: 3.75 },
  { date: '2008-11-12', rate: 3.25 },
  { date: '2008-12-10', rate: 2.5 },
  { date: '2009-01-21', rate: 2 },
  { date: '2009-03-11', rate: 1.5 },
  { date: '2009-04-08', rate: 1.25 },
  { date: '2009-05-13', rate: 1 },
  { date: '2011-04-13', rate: 1.25 },
  { date: '2011-07-13', rate: 1.5 },
  { date: '2011-11-09', rate: 1.25 },
  { date: '2011-12-14', rate: 1 },
  { date: '2012-07-11', rate: 0.75 },
  { date: '2013-05-08', rate: 0.5 },
  { date: '2013-11-13', rate: 0.25 },
  { date: '2014-06-11', rate: 0.15 },
  { date: '2014-09-10', rate: 0.05 },
  { date: '2016-03-16', rate: 0 },
  { date: '2022-07-27', rate: 0.5 },
  { date: '2022-09-14', rate: 1.25 },
  { date: '2022-11-02', rate: 2 },
  { date: '2022-12-21', rate: 2.5 },
  { date: '2023-02-08', rate: 3 },
  { date: '2023-03-22', rate: 3.5 },
  { date: '2023-05-10', rate: 3.75 },
  { date: '2023-06-21', rate: 4 },
  { date: '2023-08-02', rate: 4.25 },
  { date: '2023-09-20', rate: 4.5 },
  { date: '2024-06-12', rate: 4.25 },
  { date: '2024-09-18', rate: 3.65 },
  { date: '2024-10-23', rate: 3.4 },
  { date: '2024-12-18', rate: 3.15 },
  { date: '2025-02-05', rate: 2.9 },
  { date: '2025-03-12', rate: 2.65 },
  { date: '2025-04-23', rate: 2.4 },
  { date: '2025-06-11', rate: 2.15 },
  { date: '2026-06-17', rate: 2.4 },
  { date: '2026-09-16', rate: 2.65 },
]

function parseCsv(csv: string): RateChange[] {
  const lines = csv.trim().split(/\r?\n/)
  const header = lines[0]?.split(',') ?? []
  const iDate = header.indexOf('TIME_PERIOD')
  const iValue = header.indexOf('OBS_VALUE')
  if (iDate < 0 || iValue < 0) return []
  const changes: RateChange[] = []
  for (const line of lines.slice(1)) {
    const cols = line.split(',')
    const rate = parseFloat(cols[iValue])
    if (!cols[iDate] || isNaN(rate)) continue
    changes.push({ date: cols[iDate], rate })
  }
  return changes.sort((a, b) => a.date.localeCompare(b.date))
}

/** Historique des changements de taux MRO (API BCE, cache 24 h). */
export async function getEcbRateChanges(): Promise<RateChange[]> {
  try {
    const res = await fetch(ECB_MRO_CSV, { next: { revalidate: 86400 } })
    if (res.ok) {
      const changes = parseCsv(await res.text())
      if (changes.length > 10) return changes
    }
    console.error(`BCE MRO: HTTP ${res.status}, repli sur les taux enregistrés`)
  } catch (err) {
    console.error('BCE MRO:', err)
  }
  return FALLBACK
}

export function ecbRateAt(changes: RateChange[], isoDate: string): number | null {
  let rate: number | null = null
  for (const c of changes) {
    if (c.date <= isoDate) rate = c.rate
    else break
  }
  return rate
}

function semesterLabel(start: string): string {
  const [y, m] = start.split('-')
  return `${m === '01' ? '1er' : '2e'} semestre ${y}`
}

/**
 * Taux des intérêts moratoires par semestre, du 1er semestre `fromYear` au
 * semestre en cours à la date `today`, du plus ancien au plus récent.
 */
export function semesterRates(changes: RateChange[], today: string, fromYear = 2013): SemesterRate[] {
  const rows: SemesterRate[] = []
  const currentYear = Number(today.slice(0, 4))
  for (let y = fromYear; y <= currentYear; y++) {
    for (const mm of ['01', '07']) {
      const start = `${y}-${mm}-01`
      if (start > today) break
      const ecb = ecbRateAt(changes, start)
      if (ecb === null) continue
      rows.push({ start, label: semesterLabel(start), ecb, taux: Math.round((ecb + MAJORATION_POINTS) * 100) / 100 })
    }
  }
  return rows
}

export function lastRateChange(changes: RateChange[]): RateChange | null {
  return changes.length ? changes[changes.length - 1] : null
}
