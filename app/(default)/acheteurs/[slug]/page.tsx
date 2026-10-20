export const revalidate = 86400

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { motifAcheteur, nomAffiche } from '@/lib/acheteurs'
import { acheteurHref, marchesAcheteur, siretDepuisSlug, slugAcheteur, statistiques, type Marche, type Stats } from '@/lib/decp/marches'
import { departementLabel } from '@/lib/alertes/geo'
import { fmtDate, fmtEur, fmtNum } from '@/lib/format'
import AoItem from '@/app/(default)/ao-item'
import AlerteSignup from '@/components/alertes/alerte-signup'
import { Badge, Breadcrumb, RelatedTools, UpdatedAt } from '@/components/outils/sections'
import { Stat } from '@/components/outils/form'

const SEUIL_INDEXATION = 5
const DATASET = 'https://www.data.gouv.fr/datasets/donnees-essentielles-de-la-commande-publique-consolidees-format-tabulaire'

interface PageProps {
  params: Promise<{ slug: string }>
}

const depuis3Ans = () => new Date(Date.now() - 3 * 365 * 86400000).toISOString().slice(0, 10)
const eurCourt = (n: number) => (n >= 1e6 ? `${fmtNum(n / 1e6, 1)} M€` : n >= 1e3 ? `${fmtNum(n / 1e3, 0)} k€` : fmtEur(n, 0))

async function charger(slug: string) {
  const siret = siretDepuisSlug(slug)
  if (!siret) return null
  const marches = await marchesAcheteur(siret, depuis3Ans())
  if (!marches.length) return null
  const nom = marches.find((m) => m.acheteur_nom)?.acheteur_nom ?? `Acheteur ${siret}`
  return { siret, nom, affiche: nomAffiche(nom) ?? nom, marches, stats: statistiques(marches), ref: marches[0] }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await charger((await params).slug)
  if (!data) return {}
  const { nom, affiche, stats, siret } = data
  return {
    title: { absolute: `${affiche} : appels d'offres en cours et marchés attribués | mon-ao.com` },
    description: `${affiche} : ${fmtNum(stats.nbMarches, 0)} marchés publics attribués sur 3 ans${stats.montantTotal ? ` pour ${eurCourt(stats.montantTotal)}` : ''}, attributaires fréquents, nombre moyen d'offres et appels d'offres en cours.`,
    alternates: { canonical: acheteurHref(nom, siret) },
    robots: stats.nbMarches < SEUIL_INDEXATION ? { index: false, follow: true } : undefined,
  }
}

function synthese(nom: string, s: Stats, debut: string): string {
  const phrases: string[] = []
  phrases.push(`${nom} a attribué ${fmtNum(s.nbMarches, 0)} marché${s.nbMarches > 1 ? 's' : ''} public${s.nbMarches > 1 ? 's' : ''} notifié${s.nbMarches > 1 ? 's' : ''} depuis ${debut.slice(0, 4)}${s.montantTotal ? `, pour un montant cumulé d'environ ${eurCourt(s.montantTotal)}` : ''}.`)
  const type = s.parType[0]
  if (type && s.nbMarches) {
    const part = Math.round((type.nb / s.nbMarches) * 100)
    const corps = s.parCorps[0]
    phrases.push(`Les marchés de ${type.type} en représentent ${part} %${corps ? `, avec en tête le corps d'état « ${corps.corps.toLowerCase()} » (${corps.nb} marché${corps.nb > 1 ? 's' : ''})` : ''}.`)
  }
  if (s.offresMoyenne) {
    const niveau = s.offresMoyenne < 3 ? 'une concurrence faible' : s.offresMoyenne < 6 ? 'une concurrence modérée' : 'une concurrence forte'
    phrases.push(`Ses consultations reçoivent en moyenne ${fmtNum(s.offresMoyenne, 1)} offres, signe d'${niveau}.`)
  }
  const top = s.topTitulaires[0]
  if (top && top.nb > 1) phrases.push(`${top.nom} est l'attributaire le plus fréquent, avec ${top.nb} marchés sur la période.`)
  return phrases.join(' ')
}

async function aoEnCours(nom: string) {
  const sb = getSupabase()
  const motif = motifAcheteur(nom)
  if (!sb || !motif) return []
  const { data } = await sb
    .from('appels_offre')
    .select('*')
    .ilike('acheteur', `%${motif.replace(/\*/g, '%')}%`)
    .gte('date_limite', new Date().toISOString())
    .order('date_publication', { ascending: false })
    .limit(5)
  return (data ?? []) as AppelOffre[]
}

function Barres({ items, valeur, label }: { items: { cle: string; v: number; detail?: string }[]; valeur: (n: number) => string; label: string }) {
  const max = Math.max(...items.map((i) => i.v), 1)
  return (
    <ul className="space-y-2" aria-label={label}>
      {items.map((i) => (
        <li key={i.cle} className="grid grid-cols-[8rem_1fr_auto] items-center gap-3 text-sm">
          <span className="truncate text-gray-600" title={i.cle}>{i.cle}</span>
          <span className="h-2.5 rounded-full bg-gray-100 overflow-hidden"><span className="block h-full rounded-full bg-blue-500" style={{ width: `${(i.v / max) * 100}%` }} /></span>
          <span className="text-gray-900 font-medium tabular-nums">{valeur(i.v)}{i.detail && <span className="text-gray-400 font-normal"> · {i.detail}</span>}</span>
        </li>
      ))}
    </ul>
  )
}

export default async function AcheteurPage({ params }: PageProps) {
  const { slug } = await params
  const data = await charger(slug)
  if (!data) notFound()
  const { siret, nom, affiche, marches, stats, ref } = data
  if (slug !== slugAcheteur(nom, siret)) permanentRedirect(acheteurHref(nom, siret))

  const enCours = await aoEnCours(nom)
  const debut = depuis3Ans()
  const derniers: Marche[] = Array.from(new Map(marches.map((m) => [m.uid, m])).values()).slice(0, 15)
  const localisation = [ref.acheteur_commune, ref.acheteur_departement ? departementLabel(ref.acheteur_departement) : null].filter(Boolean).join(', ')

  return (
    <>
      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-[28rem] bg-linear-to-b from-blue-100 to-white pointer-events-none -z-10" aria-hidden="true" />
        <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
          <div className="pt-28 md:pt-36 pb-8 max-w-4xl">
            <Breadcrumb items={[{ name: 'Accueil', href: '/' }, { name: 'Acheteurs publics', href: '/acheteurs' }, { name: affiche, href: acheteurHref(nom, siret) }]} />
            <div className="mb-5"><Badge>{ref.acheteur_categorie ?? 'Acheteur public'}</Badge></div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.08] mb-4">{affiche}</h1>
            <p className="text-gray-500 mb-6">
              {localisation && <>{localisation} · </>}SIRET{' '}
              <a href={`https://annuaire-entreprises.data.gouv.fr/etablissement/${siret}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{siret}</a>
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">{synthese(affiche, stats, debut)}</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            <Stat accent label="Marchés attribués (3 ans)" value={fmtNum(stats.nbMarches, 0)} />
            <Stat label="Montant cumulé" value={stats.montantTotal ? eurCourt(stats.montantTotal) : '—'} />
            <Stat label="Montant moyen" value={stats.montantMoyen ? eurCourt(stats.montantMoyen) : '—'} />
            <Stat label="Offres reçues en moyenne" value={stats.offresMoyenne ? fmtNum(stats.offresMoyenne, 1) : '—'} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-10">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
              <h2 className="font-bold text-gray-900 mb-4">Marchés attribués par an</h2>
              <Barres label="Marchés par an" items={stats.parAnnee.map((a) => ({ cle: a.annee, v: a.nb, detail: a.montant ? eurCourt(a.montant) : undefined }))} valeur={(n) => fmtNum(n, 0)} />
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
              <h2 className="font-bold text-gray-900 mb-4">Répartition par corps d'état</h2>
              {stats.parCorps.length ? (
                <Barres label="Marchés par corps d'état" items={stats.parCorps.slice(0, 6).map((c) => ({ cle: c.corps, v: c.nb }))} valeur={(n) => fmtNum(n, 0)} />
              ) : (
                <p className="text-sm text-gray-500">Pas de marché de travaux classable par corps d'état.</p>
              )}
              <p className="mt-4 text-sm text-gray-500">
                Par type : {stats.parType.map((t) => `${t.type} ${t.nb}`).join(' · ')}
              </p>
            </div>
          </div>

          <div className="mb-10">
            <AlerteSignup source={`acheteur/${siret}`} criteres={{ acheteurs: [nom] }} contexte={`de ${affiche}`} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-4">Appels d'offres en cours</h2>
              {enCours.length ? (
                <div className="flex flex-col gap-3">{enCours.map((ao) => <AoItem key={ao.id} {...ao} />)}</div>
              ) : (
                <p className="text-gray-500">Aucun appel d'offres ouvert de cet acheteur repéré au BOAMP pour le moment.</p>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-4">Attributaires fréquents</h2>
              <ol className="rounded-2xl border border-gray-200 bg-white divide-y divide-gray-100">
                {stats.topTitulaires.map((t, i) => (
                  <li key={t.id || t.nom} className="flex justify-between gap-3 px-4 py-2.5 text-sm">
                    <span className="text-gray-800"><span className="text-gray-400 mr-2">{i + 1}.</span>{t.nom}</span>
                    <span className="shrink-0 text-gray-500">{t.nb} marché{t.nb > 1 ? 's' : ''}{t.montant ? ` · ${eurCourt(t.montant)}` : ''}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-4">Derniers marchés attribués</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                  <tr>{['Notifié le', 'Objet', 'Attributaire', 'Montant HT', 'Offres'].map((h) => <th key={h} scope="col" className="px-3 py-3 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {derniers.map((m) => (
                    <tr key={m.id} className="align-top">
                      <td className="px-3 py-3 whitespace-nowrap text-gray-500">{fmtDate(m.date_notification)}</td>
                      <td className="px-3 py-3 min-w-64 text-gray-900">{m.objet ?? '—'}</td>
                      <td className="px-3 py-3 min-w-40 text-gray-800">{m.titulaire_nom ?? '—'}</td>
                      <td className="px-3 py-3 whitespace-nowrap font-semibold">{m.montant ? fmtEur(m.montant, 0) : '—'}</td>
                      <td className="px-3 py-3 text-center">{m.offres_recues ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm">
              <Link href={`/qui-gagne-quoi?acheteur=${siret}&periode=3a`} className="font-medium text-blue-600 hover:underline">Tous les marchés de cet acheteur →</Link>
            </p>
          </div>

          <UpdatedAt
            date={new Date().toISOString().slice(0, 10)}
            note="données essentielles de la commande publique, 3 dernières années"
            sources={[{ label: 'DECP consolidées (data.gouv.fr)', href: DATASET }]}
          />
        </div>
      </section>

      <section>
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12 md:py-16">
          <RelatedTools current="qui-gagne-quoi" />
        </div>
      </section>
    </>
  )
}
