import { INDICES, type IndiceDef } from './indices-catalog'

// Données INSEE (Banque de données macro-économiques, API SDMX en accès libre).
// Les réponses sont mises en cache 24 h : un index publié au JO apparaît sur le
// site le lendemain, sans cron.

const INSEE_BDM = 'https://api.insee.fr/series/BDM/data'
const DATAFLOW = 'INDEX-BT-TP-DIV-IM-2010'
const REVALIDATE = 86400

export type IndiceObs = {
  /** Mois, au format YYYY-MM */
  p: string
  v: number
  /** Valeur définitive (false = provisoire) */
  def: boolean
  /** Date de publication au Journal officiel (YYYY-MM-DD) */
  jo: string | null
}

export type IndiceSerie = {
  code: string
  idbank: string
  label: string
  /** Dernière mise à jour INSEE de la série (YYYY-MM-DD) */
  lastUpdate: string | null
  /** Observations triées par mois croissant */
  obs: IndiceObs[]
}

function decodeEntities(s: string): string {
  return s
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function parseAttrs(s: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const m of Array.from(s.matchAll(/([A-Z_]+)="([^"]*)"/g))) attrs[m[1]] = decodeEntities(m[2])
  return attrs
}

type ParsedSeries = { idbank: string; lastUpdate: string | null; obs: IndiceObs[] }

function parseSdmx(xml: string): ParsedSeries[] {
  const out: ParsedSeries[] = []
  for (const m of Array.from(xml.matchAll(/<Series ([^>]*)>([\s\S]*?)<\/Series>/g))) {
    const attrs = parseAttrs(m[1])
    const obs: IndiceObs[] = []
    for (const o of Array.from(m[2].matchAll(/<Obs ([^>]*?)\/?>/g))) {
      const a = parseAttrs(o[1])
      const v = parseFloat(a.OBS_VALUE)
      if (!a.TIME_PERIOD || isNaN(v)) continue
      obs.push({ p: a.TIME_PERIOD, v, def: a.OBS_QUAL === 'DEF', jo: a.DATE_JO || null })
    }
    obs.sort((x, y) => x.p.localeCompare(y.p))
    out.push({ idbank: attrs.IDBANK, lastUpdate: attrs.LAST_UPDATE || null, obs })
  }
  return out
}

function toSerie(def: IndiceDef, parsed: ParsedSeries): IndiceSerie {
  return { code: def.code, idbank: def.idbank, label: def.label, lastUpdate: parsed.lastUpdate, obs: parsed.obs }
}

/** Historique complet d'un index (base 2010). */
export async function getIndiceSerie(def: IndiceDef): Promise<IndiceSerie | null> {
  try {
    const res = await fetch(`${INSEE_BDM}/SERIES_BDM/${def.idbank}`, { next: { revalidate: REVALIDATE } })
    if (!res.ok) {
      console.error(`INSEE ${def.code}: HTTP ${res.status}`)
      return null
    }
    const parsed = parseSdmx(await res.text())[0]
    return parsed ? toSerie(def, parsed) : null
  } catch (err) {
    console.error(`INSEE ${def.code}:`, err)
    return null
  }
}

/** Les 13 derniers mois de tous les index, en une requête (pour les listes). */
export async function getAllIndicesLatest(): Promise<Map<string, IndiceSerie>> {
  const byCode = new Map<string, IndiceSerie>()
  try {
    const res = await fetch(`${INSEE_BDM}/${DATAFLOW}?lastNObservations=13`, { next: { revalidate: REVALIDATE } })
    if (!res.ok) {
      console.error(`INSEE ${DATAFLOW}: HTTP ${res.status}`)
      return byCode
    }
    const byIdbank = new Map(parseSdmx(await res.text()).map((s) => [s.idbank, s]))
    for (const def of INDICES) {
      const parsed = byIdbank.get(def.idbank)
      if (parsed) byCode.set(def.code, toSerie(def, parsed))
    }
  } catch (err) {
    console.error(`INSEE ${DATAFLOW}:`, err)
  }
  return byCode
}

export function lastObs(serie: IndiceSerie | null | undefined): IndiceObs | null {
  return serie?.obs.length ? serie.obs[serie.obs.length - 1] : null
}

/** Variation (en %) entre la dernière valeur et celle d'il y a `months` mois. */
export function variation(serie: IndiceSerie, months: number): number | null {
  const last = lastObs(serie)
  if (!last) return null
  const [y, m] = last.p.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 - months, 1))
  const target = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
  const ref = serie.obs.find((o) => o.p === target)
  return ref ? ((last.v - ref.v) / ref.v) * 100 : null
}
