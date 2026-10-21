export const revalidate = 3600

import type { Metadata } from 'next'
import Link from 'next/link'
import { OUTILS, OUTILS_BIENTOT } from '@/lib/outils/catalog'
import { getAllIndicesLatest, lastObs, variation } from '@/lib/indices'
import { indiceHref } from '@/lib/indices-catalog'
import { fmtMonth, fmtNum, fmtPct } from '@/lib/format'
import { ToolsHubJsonLd } from '@/components/json-ld'
import { Accent, Badge, Breadcrumb, RelatedAos } from '@/components/outils/sections'

export const metadata: Metadata = {
  title: { absolute: 'Outils gratuits pour les marchés publics : calculateurs et simulateurs | mon-ao.com' },
  description:
    'Calculateur de révision de prix (index BT et TP), d\'intérêts moratoires et simulateur de note prix : des outils gratuits, sans inscription, pour les entreprises qui répondent aux marchés publics.',
  alternates: { canonical: '/outils' },
}

const INDICES_HUB = ['BT01', 'BT50', 'TP01', 'TP02']

export default async function OutilsPage() {
  const latest = await getAllIndicesLatest()
  const indices = INDICES_HUB.map((c) => latest.get(c)).filter((s) => !!s)

  return (
    <>
      <ToolsHubJsonLd tools={OUTILS.map((o) => ({ name: o.title, href: o.href, description: o.description }))} />

      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-[32rem] bg-linear-to-b from-blue-100 to-white pointer-events-none -z-10" aria-hidden="true" />
        <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
          <div className="pt-28 md:pt-36 pb-10">
            <Breadcrumb items={[{ name: 'Accueil', href: '/' }, { name: 'Outils gratuits', href: '/outils' }]} />
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-5"><Badge>Outils gratuits</Badge></div>
              <h1 className="h1 font-inter tracking-tight text-gray-900 mb-5">
                Des outils <Accent>gratuits</Accent> pour gagner vos marchés publics
              </h1>
              <p className="text-lg text-gray-500">
                Calculateurs et simulateurs pour les entreprises du BTP qui répondent aux appels d'offres : résultat immédiat, sans
                inscription ni logiciel à installer.
              </p>
            </div>
          </div>

          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Disponibles</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {OUTILS.map((o) => (
              <Link
                key={o.slug}
                href={o.href}
                className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-xs transition hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl" aria-hidden="true">{o.emoji}</span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">Disponible</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 mb-2">{o.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">{o.description}</p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                  {o.cta} <span className="transition group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            ))}
          </div>

          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-12 mb-4">Bientôt</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {OUTILS_BIENTOT.map((o) => (
              <div key={o.slug} className="flex gap-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl grayscale" aria-hidden="true">{o.emoji}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-700">{o.title}</h3>
                    <span className="rounded-full bg-gray-200/70 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Bientôt</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{o.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-screen-xl mx-auto px-6 sm:px-8 py-14 md:py-20">
          <div className="rounded-3xl bg-blue-500 px-6 py-10 md:px-12 md:py-12 text-white md:flex md:items-center md:gap-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <p className="font-nycd text-2xl text-blue-100 mb-2">Mis à jour chaque mois</p>
              <h2 className="text-3xl font-extrabold tracking-tight mb-3">Les index BT et TP de l'INSEE</h2>
              <p className="text-blue-100 mb-6">
                Dernière valeur, historique depuis 2014 et graphique pour plus de 80 index du bâtiment, des travaux publics et divers
                de la construction.
              </p>
              <Link href="/indices" className="btn bg-white text-blue-600 hover:bg-blue-50">Consulter les index →</Link>
            </div>
            {indices.length > 0 && (
              <ul className="md:w-1/2 grid grid-cols-2 gap-3">
                {indices.map((s) => {
                  const last = lastObs(s)!
                  const v12 = variation(s, 12)
                  return (
                    <li key={s.code}>
                      <Link href={indiceHref(s.code)} className="block rounded-2xl bg-white/10 px-4 py-3 transition hover:bg-white/20">
                        <span className="block text-sm font-semibold text-blue-100">{s.code}</span>
                        <span className="block text-2xl font-extrabold">{fmtNum(last.v, 1)}</span>
                        <span className="block text-xs text-blue-100">
                          {fmtMonth(last.p)}{v12 !== null && <> · {fmtPct(v12, 1, true)} sur 1 an</>}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-5xl mx-auto px-6 sm:px-8 pb-16 md:pb-20">
          <RelatedAos title="Trouvez votre prochain marché de travaux" />
        </div>
      </section>
    </>
  )
}
