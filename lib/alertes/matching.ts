import type { SupabaseClient } from '@supabase/supabase-js'
import { aoHref } from '@/app/(default)/ao-item'
import type { Criteres } from './criteres'
import { normaliserTexte } from './corps-etat'
import { variantesDepartement } from './geo'
import { motifAcheteur } from '@/lib/acheteurs'
import type { AoEmail } from './emails'

const COLONNES = 'id, slug, categorie, titre, objet, acheteur, departement, region_label, montant_estime, date_limite'

/**
 * AO ajoutés depuis `depuis` qui correspondent aux critères.
 * Métier (catégories ou CPV), zone, mots-clés, montant, type et procédure se combinent en ET ;
 * les AO sans montant estimé sont gardés quand une fourchette est demandée.
 */
export async function chercherAos(
  sb: SupabaseClient,
  c: Criteres,
  depuis: string,
  limit = 30,
): Promise<{ items: AoEmail[]; total: number }> {
  let q = sb
    .from('appels_offre')
    .select(COLONNES, { count: 'exact' })
    .gte('created_at', depuis)
    .order('date_publication', { ascending: false })
    .limit(Math.min(limit + 20, 100))

  const metier = [
    c.categories.length ? `categorie.in.(${c.categories.join(',')})` : null,
    ...c.cpv.map((p) => `cpv_code.like.${p}*`),
  ].filter(Boolean)
  if (metier.length) q = q.or(metier.join(','))

  const motifs = c.acheteurs.map(motifAcheteur).filter((m): m is string => !!m)
  if (motifs.length) q = q.or(motifs.map((m) => `acheteur.ilike.*${m}*`).join(','))

  if (c.motsCles.length) q = q.or(c.motsCles.flatMap((k) => [`titre.ilike.*${k}*`, `objet.ilike.*${k}*`]).join(','))

  const deps = c.departements.flatMap(variantesDepartement)
  const zone = [deps.length ? `departement.in.(${deps.join(',')})` : null, c.regions.length ? `region.in.(${c.regions.join(',')})` : null].filter(Boolean)
  if (zone.length) q = q.or(zone.join(','))

  if (c.types.length) q = q.in('type_marche', c.types)
  if (c.procedures.length) q = q.in('procedure', c.procedures)

  if (c.montantMin !== null || c.montantMax !== null) {
    const bornes = [c.montantMin !== null ? `montant_estime.gte.${c.montantMin}` : null, c.montantMax !== null ? `montant_estime.lte.${c.montantMax}` : null].filter(Boolean)
    q = q.or(`montant_estime.is.null,and(${bornes.join(',')})`)
  }

  const { data, count, error } = await q
  if (error) {
    console.error('chercherAos:', error.message)
    return { items: [], total: 0 }
  }

  // Mots exclus : filtrés ici (un objet vide ne doit pas exclure l'avis)
  const exclus = c.exclus.map(normaliserTexte)
  const rows = (data ?? []).filter((ao) => {
    if (!exclus.length) return true
    const texte = normaliserTexte(`${ao.titre ?? ''} ${ao.objet ?? ''}`)
    return !exclus.some((x) => texte.includes(x))
  })
  const retires = (data?.length ?? 0) - rows.length

  return {
    total: Math.max(0, (count ?? 0) - retires),
    items: rows.slice(0, limit).map((ao) => ({
      id: ao.id,
      href: aoHref(ao),
      titre: ao.titre,
      acheteur: ao.acheteur,
      departement: ao.departement,
      region_label: ao.region_label,
      montant_estime: ao.montant_estime,
      date_limite: ao.date_limite,
    })),
  }
}
