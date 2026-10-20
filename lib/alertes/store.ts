// Accès aux tables des alertes (service role, côté serveur uniquement).
import { randomBytes } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase'
import { CORPS_ETAT } from './corps-etat'
import { MAX_ALERTES_PAR_ABONNE, type Criteres, type Frequence } from './criteres'
import { REGIONS } from './geo'

export const COOKIE_ABONNE = 'mon_ao_abonne'

export type Abonne = {
  id: string
  email: string
  token: string
  confirm_token: string | null
  confirmed_at: string | null
  unsubscribed_at: string | null
  created_at: string
}

export type Alerte = {
  id: string
  abonne_id: string
  nom: string | null
  criteres: Criteres
  frequence: Frequence
  actif: boolean
  last_sent_at: string | null
  created_at: string
}

export class StoreIndisponible extends Error {}

export function admin(): SupabaseClient {
  const sb = getSupabaseAdmin()
  if (!sb) throw new StoreIndisponible('Supabase non configuré')
  return sb
}

/** Erreur « table absente » : la migration n'est pas encore appliquée. */
export function tableManquante(err: { code?: string; message?: string } | null): boolean {
  return !!err && (err.code === '42P01' || err.code === 'PGRST205' || /does not exist|schema cache/i.test(err.message ?? ''))
}

function check<T>(res: { data: T; error: { code?: string; message: string } | null }): T {
  if (res.error) {
    if (tableManquante(res.error)) throw new StoreIndisponible('Tables des alertes absentes : appliquez supabase/migrations/20261020_02_alertes.sql')
    throw new Error(res.error.message)
  }
  return res.data
}

export function genToken(): string {
  return randomBytes(24).toString('base64url')
}

export function emailValide(email: unknown): email is string {
  return typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

export async function abonneParEmail(email: string): Promise<Abonne | null> {
  return check(await admin().from('abonnes').select('*').eq('email', email.toLowerCase()).maybeSingle()) as Abonne | null
}

export async function abonneParToken(token: string | null | undefined): Promise<Abonne | null> {
  if (!token || token.length < 20) return null
  return check(await admin().from('abonnes').select('*').eq('token', token).maybeSingle()) as Abonne | null
}

/** Crée l'abonné s'il n'existe pas ; réactive un abonné désinscrit (nouvelle confirmation requise). */
export async function obtenirAbonne(email: string, source: string | null): Promise<Abonne> {
  const existant = await abonneParEmail(email)
  if (existant && !existant.unsubscribed_at) return existant
  if (existant) {
    return check(
      await admin()
        .from('abonnes')
        .update({ unsubscribed_at: null, confirmed_at: null, confirm_token: genToken() })
        .eq('id', existant.id)
        .select('*')
        .single(),
    ) as Abonne
  }
  return check(
    await admin()
      .from('abonnes')
      .insert({ email: email.toLowerCase(), token: genToken(), confirm_token: genToken(), source })
      .select('*')
      .single(),
  ) as Abonne
}

export async function confirmerAbonne(confirmToken: string): Promise<Abonne | null> {
  if (!confirmToken || confirmToken.length < 20) return null
  const abonne = check(await admin().from('abonnes').select('*').eq('confirm_token', confirmToken).maybeSingle()) as Abonne | null
  if (!abonne) return null
  if (abonne.confirmed_at) return abonne
  return check(
    await admin().from('abonnes').update({ confirmed_at: new Date().toISOString() }).eq('id', abonne.id).select('*').single(),
  ) as Abonne
}

/** Évite de renvoyer un email de confirmation plus d'une fois toutes les 10 minutes. */
export async function confirmationRecente(abonneId: string): Promise<boolean> {
  const depuis = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { count } = await admin()
    .from('emails_envoyes')
    .select('id', { count: 'exact', head: true })
    .eq('abonne_id', abonneId)
    .eq('type', 'confirmation')
    .gte('created_at', depuis)
  return (count ?? 0) > 0
}

export async function journaliserEmail(abonneId: string | null, type: string, sujet: string, providerId: string | null, nbAo?: number) {
  const { error } = await admin().from('emails_envoyes').insert({ abonne_id: abonneId, type, sujet, provider_id: providerId, nb_ao: nbAo ?? null })
  if (error) console.error('journaliserEmail:', error.message)
}

export async function alertesDe(abonneId: string): Promise<Alerte[]> {
  return check(await admin().from('alertes').select('*').eq('abonne_id', abonneId).order('created_at')) as Alerte[]
}

export async function creerAlerte(abonneId: string, criteres: Criteres, frequence: Frequence, nom: string | null): Promise<Alerte> {
  const existantes = await alertesDe(abonneId)
  if (existantes.length >= MAX_ALERTES_PAR_ABONNE) throw new Error(`Maximum ${MAX_ALERTES_PAR_ABONNE} alertes par adresse`)
  const alerte = check(
    await admin().from('alertes').insert({ abonne_id: abonneId, criteres, frequence, nom }).select('*').single(),
  ) as Alerte
  await majSegmentation(abonneId)
  return alerte
}

export async function modifierAlerte(abonneId: string, id: string, patch: Partial<Pick<Alerte, 'criteres' | 'frequence' | 'actif' | 'nom'>>) {
  check(await admin().from('alertes').update(patch).eq('id', id).eq('abonne_id', abonneId).select('id').single())
  await majSegmentation(abonneId)
}

export async function supprimerAlerte(abonneId: string, id: string) {
  check(await admin().from('alertes').delete().eq('id', id).eq('abonne_id', abonneId).select('id'))
  await majSegmentation(abonneId)
}

export async function desinscrire(abonneId: string) {
  check(await admin().from('abonnes').update({ unsubscribed_at: new Date().toISOString() }).eq('id', abonneId).select('id'))
}

/** Segmentation CRM : corps d'état et départements couverts par les alertes de l'abonné. */
async function majSegmentation(abonneId: string) {
  const alertes = await alertesDe(abonneId)
  const cats = new Set(alertes.flatMap((a) => a.criteres.categories))
  const corps = CORPS_ETAT.filter((g) => g.categories.some((c) => cats.has(c))).map((g) => g.slug)
  const deps = new Set(alertes.flatMap((a) => [...a.criteres.departements, ...a.criteres.regions.flatMap((r) => REGIONS.find((x) => x.slug === r)?.departements ?? [])]))
  await admin().from('abonnes').update({ corps_etat: corps, departements: Array.from(deps) }).eq('id', abonneId)
}

// ─── Favoris ──────────────────────────────────────────────────────────────────

export async function ajouterFavori(abonneId: string, aoId: number) {
  check(await admin().from('favoris').upsert({ abonne_id: abonneId, ao_id: aoId }, { onConflict: 'abonne_id,ao_id', ignoreDuplicates: true }).select('ao_id'))
}

export async function retirerFavori(abonneId: string, aoId: number) {
  check(await admin().from('favoris').delete().eq('abonne_id', abonneId).eq('ao_id', aoId).select('ao_id'))
}

export async function favorisDe(abonneId: string) {
  return check(
    await admin()
      .from('favoris')
      .select('ao_id, created_at, appels_offre (id, slug, categorie, titre, acheteur, date_limite)')
      .eq('abonne_id', abonneId)
      .order('created_at', { ascending: false }),
  ) as unknown as { ao_id: number; created_at: string; appels_offre: { id: number; slug: string; categorie: string | null; titre: string; acheteur: string | null; date_limite: string | null } | null }[]
}

// ─── Rappels d'attestation ────────────────────────────────────────────────────

export const DUREES_ATTESTATION: Record<string, { label: string; mois: number | 'fin-annee' }> = {
  'attestation-vigilance': { label: 'Attestation de vigilance URSSAF', mois: 6 },
  'attestation-regularite-fiscale': { label: 'Attestation de régularité fiscale', mois: 6 },
  kbis: { label: 'Extrait Kbis', mois: 3 },
  'attestation-assurance': { label: 'Attestation d\'assurance', mois: 'fin-annee' },
}

export function dateExpiration(piece: string, delivreeLe: string): string | null {
  const d = DUREES_ATTESTATION[piece]
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(delivreeLe)) return null
  if (d.mois === 'fin-annee') return `${delivreeLe.slice(0, 4)}-12-31`
  const [y, m, day] = delivreeLe.split('-').map(Number)
  const exp = new Date(Date.UTC(y, m - 1 + d.mois, day))
  return exp.toISOString().slice(0, 10)
}

export async function ajouterRappel(abonneId: string, piece: string, delivreeLe: string, expireLe: string) {
  check(await admin().from('rappels_attestation').insert({ abonne_id: abonneId, piece, delivree_le: delivreeLe, expire_le: expireLe }).select('id'))
}

export async function rappelsDe(abonneId: string) {
  return check(await admin().from('rappels_attestation').select('*').eq('abonne_id', abonneId).order('expire_le')) as {
    id: string; piece: string; delivree_le: string; expire_le: string; rappel_envoye_at: string | null
  }[]
}

export async function supprimerRappel(abonneId: string, id: string) {
  check(await admin().from('rappels_attestation').delete().eq('id', id).eq('abonne_id', abonneId).select('id'))
}
