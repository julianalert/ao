export const revalidate = 86400

import type { Metadata } from 'next'
import Link from 'next/link'
import { FAMILLE_LABELS, indiceHref, INDICES, type FamilleIndice } from '@/lib/indices-catalog'
import { getAllIndicesLatest, lastObs, variation } from '@/lib/indices'
import { fmtDate, fmtMonth, fmtNum, fmtPct } from '@/lib/format'
import { Accent, Badge, Breadcrumb } from '@/components/outils/sections'

export const metadata: Metadata = {
  title: { absolute: 'Index BT et TP : dernières valeurs INSEE (bâtiment, travaux publics) | mon-ao.com' },
  description:
    'Dernières valeurs des index BT01 à BT55, TP01 à TP14 et divers de la construction publiées par l\'INSEE, variations sur 1 et 12 mois, historique et calcul de révision de prix.',
  alternates: { canonical: '/indices' },
}

const pct = (v: number | null) =>
  v === null ? <span className="text-gray-300">—</span> : (
    <span className={v > 0 ? 'text-rose-600' : v < 0 ? 'text-emerald-600' : 'text-gray-500'}>{fmtPct(v, 1, true)}</span>
  )

export default async function IndicesPage() {
  const latest = await getAllIndicesLatest()
  const majs = Array.from(latest.values()).map((s) => s.lastUpdate).filter(Boolean).sort() as string[]
  const derniereMaj = majs[majs.length - 1]

  return (
    <section className="relative">
      <div className="absolute inset-x-0 top-0 h-[28rem] bg-linear-to-b from-blue-100 to-white pointer-events-none -z-10" aria-hidden="true" />
      <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
        <div className="pt-28 md:pt-36 pb-10">
          <Breadcrumb items={[{ name: 'Accueil', href: '/' }, { name: 'Index BT et TP', href: '/indices' }]} />
          <div className="mb-5"><Badge>Données INSEE</Badge></div>
          <h1 className="h1 font-inter tracking-tight text-gray-900 mb-5 max-w-4xl">
            Index <Accent>BT et TP</Accent> : les dernières valeurs
          </h1>
          <p className="text-lg text-gray-500 max-w-3xl mb-6">
            Les index du bâtiment, des travaux publics et divers de la construction (base 2010), synchronisés chaque jour avec
            l'INSEE{derniereMaj && <>, dernière publication le {fmtDate(derniereMaj)}</>}. Cliquez sur un index pour son historique
            complet.
          </p>
          <Link href="/outils/revision-de-prix" className="btn text-white bg-blue-500 hover:bg-blue-600 shadow-xs">
            Calculer une révision de prix →
          </Link>
        </div>

        <div className="space-y-12 pb-16 md:pb-20">
          {(['BT', 'TP', 'Divers'] as FamilleIndice[]).map((f) => (
            <div key={f}>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-4">{FAMILLE_LABELS[f]}</h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Index</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Libellé</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-right">Dernière valeur</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Mois</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-right">1 mois</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-right">12 mois</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {INDICES.filter((i) => i.famille === f).map((i) => {
                      const s = latest.get(i.code)
                      const last = lastObs(s)
                      return (
                        <tr key={i.code} className="hover:bg-blue-50/40">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Link href={indiceHref(i.code)} className="font-semibold text-blue-600 hover:underline">{i.code}</Link>
                          </td>
                          <td className="px-4 py-3 text-gray-700 min-w-64">
                            {i.label}
                            {i.arretee && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">série arrêtée</span>}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">{last ? fmtNum(last.v, 1) : '—'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{last ? fmtMonth(last.p) : '—'}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{s ? pct(variation(s, 1)) : '—'}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{s ? pct(variation(s, 12)) : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <p className="text-sm text-gray-500">
            Source :{' '}
            <a href="https://www.insee.fr/fr/statistiques/serie/001710986" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              INSEE, Banque de données macro-économiques
            </a>
            . Les séries en base 2010 démarrent en octobre 2014.
          </p>
        </div>
      </div>
    </section>
  )
}
