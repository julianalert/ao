// Quota d'analyses gratuites sans email, plafond quotidien, et journal des analyses.
import { createHash } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { admin, tableManquante } from '@/lib/alertes/store'

export const ANALYSES_GRATUITES = 3
export const COOKIE_VISITEUR = 'mon_ao_visiteur'
export const COOKIE_COMPTEUR = 'mon_ao_analyses'
const PLAFOND_JOUR = Number(process.env.ANALYSE_RC_MAX_PAR_JOUR ?? 200)

export function ipHash(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'inconnue'
  return createHash('sha256').update(`${ip}|${process.env.CRON_SECRET ?? 'mon-ao'}`).digest('hex').slice(0, 32)
}

export type EtatQuota = { gratuitesUtilisees: number; plafondAtteint: boolean; suiviBase: boolean }

/** Analyses gratuites déjà faites par ce visiteur (cookie ou adresse IP), sur 30 jours. */
export async function etatQuota(visiteurId: string, ip: string, compteurCookie: number): Promise<EtatQuota> {
  try {
    const sb = admin()
    const depuis = new Date(Date.now() - 30 * 86400000).toISOString()
    const debutJour = new Date(new Date().toISOString().slice(0, 10)).toISOString()
    const [perso, jour] = await Promise.all([
      sb.from('analyses_rc').select('id', { count: 'exact', head: true }).or(`visiteur_id.eq.${visiteurId},ip_hash.eq.${ip}`).is('email', null).eq('statut', 'ok').gte('created_at', depuis),
      sb.from('analyses_rc').select('id', { count: 'exact', head: true }).gte('created_at', debutJour),
    ])
    if (perso.error) throw perso.error
    return { gratuitesUtilisees: Math.max(perso.count ?? 0, compteurCookie), plafondAtteint: (jour.count ?? 0) >= PLAFOND_JOUR, suiviBase: true }
  } catch (err) {
    // Table absente (migration non appliquée) : on s'appuie sur le cookie seul
    if (!tableManquante(err as { code?: string; message?: string })) console.error('etatQuota:', err)
    return { gratuitesUtilisees: compteurCookie, plafondAtteint: false, suiviBase: false }
  }
}

export async function journaliserAnalyse(row: {
  visiteur_id: string
  ip_hash: string
  email: string | null
  abonne_id: string | null
  ao_id: number | null
  nb_documents: number
  tokens_entree: number | null
  tokens_sortie: number | null
  statut: 'ok' | 'erreur'
  duree_ms: number
}) {
  try {
    const { error } = await admin().from('analyses_rc').insert(row)
    if (error && !tableManquante(error)) console.error('journaliserAnalyse:', error.message)
  } catch {}
}

export const BUCKET = 'dce-temp'

/** Supprime les fichiers déposés il y a plus d'une heure (filet de sécurité si une analyse a échoué). */
export async function purgerFichiersAnciens(): Promise<number> {
  const sb = admin()
  const { data, error } = await sb.storage.from(BUCKET).list('', { limit: 1000, sortBy: { column: 'created_at', order: 'asc' } })
  if (error || !data) return 0
  const limite = Date.now() - 3600000
  const vieux = data.filter((f) => f.created_at && new Date(f.created_at).getTime() < limite).map((f) => f.name)
  if (vieux.length) await sb.storage.from(BUCKET).remove(vieux)
  return vieux.length
}
