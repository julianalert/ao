import type { Filtres, TypeMarche } from './marches'
import { CPV_CORPS_ETAT } from './cpv'

export const PERIODES = [
  { value: '12m', label: '12 derniers mois' },
  { value: '3a', label: '3 dernières années' },
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
] as const

/** Paramètres d'URL → filtres de recherche (validés). */
export function filtresDepuisParams(sp: URLSearchParams): Filtres {
  const periode = sp.get('periode') ?? '12m'
  const jour = (offsetJours: number) => new Date(Date.now() - offsetJours * 86400000).toISOString().slice(0, 10)
  let depuis = jour(365)
  let jusqua: string | undefined
  if (periode === '3a') depuis = jour(3 * 365)
  else if (/^20\d\d$/.test(periode)) {
    depuis = `${periode}-01-01`
    jusqua = `${periode}-12-31`
  }
  const nombre = (k: string) => {
    const n = Number(sp.get(k))
    return Number.isFinite(n) && n > 0 ? n : undefined
  }
  const type = sp.get('type')
  const dep = sp.get('departement')?.toUpperCase()
  const texte = (k: string) => sp.get(k)?.trim().slice(0, 80) || undefined
  return {
    depuis,
    jusqua,
    corps: CPV_CORPS_ETAT.some((c) => c.slug === sp.get('corps')) ? sp.get('corps')! : undefined,
    cpv: /^\d{2,8}$/.test(sp.get('cpv') ?? '') ? sp.get('cpv')! : undefined,
    departement: dep && /^(\d{2}|2A|2B|97\d)$/.test(dep) ? dep : undefined,
    acheteur: texte('acheteur'),
    type: type === 'travaux' || type === 'services' || type === 'fournitures' ? (type as TypeMarche) : undefined,
    montantMin: nombre('min'),
    montantMax: nombre('max'),
    motCle: texte('q'),
  }
}
