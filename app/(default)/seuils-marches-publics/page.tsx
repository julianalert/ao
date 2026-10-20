export const revalidate = 3600

import type { Metadata } from 'next'
import Link from 'next/link'
import { getSeuils, derniereRevision } from '@/lib/seuils'
import { periodeEuropeenne, seuilApplicable, type Seuil } from '@/lib/outils/procedure'
import { fmtDate, fmtEur, todayParis } from '@/lib/format'
import { Accent, Badge, Breadcrumb, ContentSection, DataTable, GuidePart, UpdatedAt } from '@/components/outils/sections'

async function periode(): Promise<string> {
  const { seuils } = await getSeuils()
  const f = seuilApplicable(seuils, 'formalise', 'travaux', null, todayParis())
  return f ? periodeEuropeenne(f) : String(new Date().getFullYear())
}

export async function generateMetadata(): Promise<Metadata> {
  const p = await periode()
  return {
    title: { absolute: `Seuils des marchés publics ${p} : tableau complet et historique | mon-ao.com` },
    description: `Tous les seuils des marchés publics ${p} : dispense de publicité, MAPA, procédure formalisée, publicité BOAMP et JOUE, pour les travaux, fournitures et services. Mis à jour à chaque révision.`,
    alternates: { canonical: '/seuils-marches-publics' },
  }
}

const CODE_LABELS: Record<string, string> = {
  dispense: 'Dispense de publicité et de mise en concurrence',
  'dispense-pac': 'Dispense temporaire (pompes à chaleur, réseaux de chaleur)',
  formalise: 'Procédure formalisée',
  'publicite-mapa': 'Publicité obligatoire des MAPA',
  ecrit: 'Marché écrit',
  'dce-en-ligne': 'Documents de consultation en ligne',
  'petit-lot-mapa': 'Petits lots en procédure adaptée',
  'petit-lot-dispense': 'Petits lots sans publicité',
}

const ACHETEUR_LABELS: Record<string, string> = { etat: 'État', collectivite: 'collectivités', 'entite-adjudicatrice': 'entités adjudicatrices' }
const FAMILLE_LABELS: Record<string, string> = { travaux: 'travaux', 'fournitures-services': 'fournitures et services' }

function perimetre(s: Seuil): string {
  const parts = [s.type_marche ? FAMILLE_LABELS[s.type_marche] : 'tous marchés', s.acheteur ? ACHETEUR_LABELS[s.acheteur] : null]
  return parts.filter(Boolean).join(', ')
}

export default async function SeuilsPage() {
  const { seuils, source } = await getSeuils()
  const today = todayParis()
  const revision = derniereRevision(seuils, today)
  const s = (code: string, famille: 'travaux' | 'fournitures-services' | null, acheteur: 'etat' | 'collectivite' | 'entite-adjudicatrice' | null) =>
    seuilApplicable(seuils, code, famille, acheteur, today)

  const formT = s('formalise', 'travaux', null)
  const p = formT ? periodeEuropeenne(formT) : ''
  const dispT = s('dispense', 'travaux', null)
  const dispFS = s('dispense', 'fournitures-services', null)
  const pub = s('publicite-mapa', null, 'collectivite')
  const avenir = seuils.filter((x) => x.valid_from > today).sort((a, b) => a.valid_from.localeCompare(b.valid_from))

  const recap = [
    { label: 'Travaux (tous acheteurs)', disp: dispT, form: formT },
    { label: 'Fournitures et services de l\'État', disp: dispFS, form: s('formalise', 'fournitures-services', 'etat') },
    { label: 'Fournitures et services des collectivités', disp: dispFS, form: s('formalise', 'fournitures-services', 'collectivite') },
    { label: 'Fournitures et services des entités adjudicatrices', disp: dispFS, form: s('formalise', 'fournitures-services', 'entite-adjudicatrice') },
  ]

  const codes = Object.keys(CODE_LABELS).filter((c) => seuils.some((x) => x.code === c))

  return (
    <>
      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-[30rem] bg-linear-to-b from-blue-100 to-white pointer-events-none -z-10" aria-hidden="true" />
        <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
          <div className="pt-28 md:pt-36 pb-10">
            <Breadcrumb items={[{ name: 'Accueil', href: '/' }, { name: 'Outils gratuits', href: '/outils' }, { name: 'Seuils des marchés publics', href: '/seuils-marches-publics' }]} />
            <div className="mb-5"><Badge>Mis à jour à chaque révision</Badge></div>
            <h1 className="h1 font-inter tracking-tight text-gray-900 mb-5 max-w-4xl">
              Seuils des marchés publics <Accent>{p}</Accent>
            </h1>
            <p className="text-lg text-gray-500 max-w-3xl mb-6">
              Tous les seuils de procédure et de publicité pour les travaux, fournitures et services
              {revision && <>, en vigueur depuis le {fmtDate(revision)}</>}. Montants hors taxes, appréciés sur la valeur totale
              estimée du besoin.
            </p>
            <Link href="/outils/procedure-selon-montant" className="btn text-white bg-blue-500 hover:bg-blue-600 shadow-xs">
              Trouver la procédure pour mon montant →
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white mb-6">
            <table className="w-full text-sm">
              <caption className="sr-only">Seuils de procédure en vigueur</caption>
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Marché</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Sans publicité</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Procédure adaptée (MAPA)</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Procédure formalisée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recap.map((r) => (
                  <tr key={r.label}>
                    <th scope="row" className="px-4 py-3 text-left font-semibold text-gray-900">{r.label}</th>
                    <td className="px-4 py-3 whitespace-nowrap">{r.disp ? `< ${fmtEur(r.disp.montant, 0)}` : '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.disp && r.form ? `${fmtEur(r.disp.montant, 0)} à ${fmtEur(r.form.montant, 0)}` : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">{r.form ? `≥ ${fmtEur(r.form.montant, 0)}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pub && (
            <p className="text-sm text-gray-500 mb-10">
              Publicité des MAPA de l'État et des collectivités : au BOAMP ou dans un journal d'annonces légales dès {fmtEur(pub.montant, 0)} HT ({pub.reference}).
              Procédures formalisées : BOAMP et JOUE.
            </p>
          )}

          {avenir.length > 0 && (
            <div className="mb-12 rounded-2xl border border-orange-200 bg-orange-50 p-5 md:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Changements à venir</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                {avenir.map((x) => (
                  <li key={x.id}>
                    <strong className="text-gray-900">{fmtDate(x.valid_from)}</strong> : {x.libelle.toLowerCase()} à{' '}
                    <strong className="text-gray-900">{fmtEur(x.montant, 0)} HT</strong> ({x.reference})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <ContentSection eyebrow="Historique" title="Tous les seuils et leur évolution" muted>
        {codes.map((code, i) => (
          <GuidePart key={code} n={i + 1} title={CODE_LABELS[code]}>
            <DataTable
              caption={CODE_LABELS[code]}
              head={['Périmètre', 'Montant HT', 'Période', 'Texte']}
              rows={seuils
                .filter((x) => x.code === code)
                .sort((a, b) => (a.type_marche ?? '').localeCompare(b.type_marche ?? '') || (a.acheteur ?? '').localeCompare(b.acheteur ?? '') || b.valid_from.localeCompare(a.valid_from))
                .map((x) => {
                  const actif = x.valid_from <= today && (!x.valid_to || today <= x.valid_to)
                  return [
                    perimetre(x),
                    <span key={x.id} className={`whitespace-nowrap ${actif ? 'font-bold text-gray-900' : ''}`}>{fmtEur(x.montant, 0)}</span>,
                    <span key={`${x.id}-p`} className="whitespace-nowrap">
                      {x.valid_to ? `${fmtDate(x.valid_from)} → ${fmtDate(x.valid_to)}` : `depuis le ${fmtDate(x.valid_from)}`}
                      {actif && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">en vigueur</span>}
                      {x.valid_from > today && <span className="ml-2 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">à venir</span>}
                    </span>,
                    x.source_url ? (
                      <a key={`${x.id}-s`} href={x.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{x.reference}</a>
                    ) : (
                      x.reference
                    ),
                  ]
                })}
            />
          </GuidePart>
        ))}

        <p className="mt-10 text-gray-600">
          Pour les entreprises de travaux, notre article{' '}
          <Link href="/blog/seuils-marches-publics-2026-travaux" className="font-medium text-blue-600 hover:underline">
            seuils des marchés publics 2026 : ce qui change pour les travaux
          </Link>{' '}
          détaille les conséquences pratiques de ces montants.
        </p>

        <UpdatedAt
          date={revision ?? today}
          note={source === 'fichier' ? 'fichier de référence' : 'table des seuils'}
          sources={[
            { label: 'Avis du 13 janvier 2026 (Légifrance)', href: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053346567' },
            { label: 'DAJ, seuils européens 2026', href: 'https://www.economie.gouv.fr/daj/commande-publique-nouveaux-seuils-europeens-applicables-au-1er-janvier-2026' },
          ]}
        />
      </ContentSection>
    </>
  )
}
